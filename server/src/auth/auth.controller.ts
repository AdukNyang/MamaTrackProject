import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';

import { serializeDoc } from '@/common/serialize.util';
import { AuthAccount } from '@/entities/AuthAccount';
import { AuthSession } from '@/entities/AuthSession';
import { AuthUser } from '@/entities/AuthUser';
import { AuthVerificationCode } from '@/entities/AuthVerificationCode';
import { generateOtpCode, hashPassword, verifyPassword } from '@/lib/auth/crypto';
import { sendVerificationEmail } from '@/lib/auth/email';
import {
  createSessionToken,
  getSessionExpiry,
  getTokenHash,
} from '@/lib/auth/session';

const OTP_TTL_MS = 15 * 60 * 1000;

function normalizeEmail(email: unknown): string | null {
  if (typeof email !== 'string') {
    return null;
  }

  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return null;
  }

  return normalized;
}

@Controller('auth')
export class AuthController {
  constructor(
    @InjectRepository(AuthUser)
    private readonly userRepo: Repository<AuthUser>,
    @InjectRepository(AuthAccount)
    private readonly accountRepo: Repository<AuthAccount>,
    @InjectRepository(AuthVerificationCode)
    private readonly codeRepo: Repository<AuthVerificationCode>,
    @InjectRepository(AuthSession)
    private readonly sessionRepo: Repository<AuthSession>,
  ) {}

  @Post()
  async handleAuth(
    @Query('action') action: string,
    @Body() body: Record<string, unknown>,
    @Headers('authorization') authorization?: string,
  ) {
    switch (action) {
      case 'sign-in':
        return this.signIn(body);
      case 'verify':
        return this.verify(body);
      case 'sign-out':
        return this.signOut(authorization);
      default:
        throw new BadRequestException('Unknown auth action');
    }
  }

  private async signIn(body: Record<string, unknown>) {
    const email = normalizeEmail(body.email);

    if (!email) {
      throw new BadRequestException('Enter a valid email address.');
    }

    if (!body.password) {
      throw new BadRequestException('Enter your password.');
    }

    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const account = await this.accountRepo.findOne({ where: { userId: user.id } });
    if (
      !account ||
      !(await verifyPassword(String(body.password), account.passwordHash))
    ) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    await this.codeRepo.delete({ email });

    const code = generateOtpCode();
    await this.codeRepo.save(
      this.codeRepo.create({
        email,
        code,
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
      }),
    );

    await sendVerificationEmail(email, code);

    return { requiresVerification: true, signingIn: false };
  }

  private async verify(body: Record<string, unknown>) {
    const email = normalizeEmail(body.email);
    const code = typeof body.code === 'string' ? body.code.trim() : '';

    if (!email || !code) {
      throw new BadRequestException('Enter your email and verification code.');
    }

    const verification = await this.codeRepo.findOne({
      where: {
        email,
        code,
        expiresAt: MoreThan(new Date()),
      },
    });

    if (!verification) {
      throw new BadRequestException(
        'That verification code is incorrect or expired.',
      );
    }

    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('Account not found.');
    }

    user.emailVerifiedAt = new Date();
    await this.userRepo.save(user);
    await this.codeRepo.delete({ email });

    const token = await createSessionToken(user.id);
    await this.sessionRepo.save(
      this.sessionRepo.create({
        userId: user.id,
        tokenHash: getTokenHash(token),
        expiresAt: getSessionExpiry(),
      }),
    );

    return {
      signingIn: true,
      token,
      user: serializeDoc(user),
    };
  }

  private async signOut(authorization?: string) {
    if (authorization?.startsWith('Bearer ')) {
      const token = authorization.slice('Bearer '.length).trim();
      await this.sessionRepo.delete({ tokenHash: getTokenHash(token) });
    }

    return { success: true };
  }
}
