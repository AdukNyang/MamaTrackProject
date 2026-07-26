import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type { RequestUser } from '@/common/current-user.decorator';
import { AuthSession } from '@/entities/AuthSession';
import { AuthUser } from '@/entities/AuthUser';
import { getTokenHash, verifySessionToken } from '@/lib/auth/session';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @InjectRepository(AuthSession)
    private readonly sessionRepo: Repository<AuthSession>,
    @InjectRepository(AuthUser)
    private readonly userRepo: Repository<AuthUser>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: RequestUser;
    }>();

    const authorization = request.headers.authorization;
    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Not authenticated');
    }

    const token = authorization.slice('Bearer '.length).trim();
    if (!token) {
      throw new UnauthorizedException('Not authenticated');
    }

    const verified = await verifySessionToken(token);
    if (!verified) {
      throw new UnauthorizedException('Not authenticated');
    }

    const session = await this.sessionRepo.findOne({
      where: {
        tokenHash: getTokenHash(token),
        userId: verified.userId,
      },
    });

    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Not authenticated');
    }

    const user = await this.userRepo.findOne({ where: { id: verified.userId } });
    if (!user) {
      throw new UnauthorizedException('Not authenticated');
    }

    request.user = { user, userId: user.id };
    return true;
  }
}
