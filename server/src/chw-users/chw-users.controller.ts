import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { AccessService } from '@/access/access.service';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import type { RequestUser } from '@/common/current-user.decorator';
import { CurrentUser } from '@/common/current-user.decorator';
import { serializeDoc, serializeDocs } from '@/common/serialize.util';
import { AuthAccount } from '@/entities/AuthAccount';
import { AuthUser } from '@/entities/AuthUser';
import { ChwUser } from '@/entities/ChwUser';
import { hashPassword } from '@/lib/auth/crypto';
import { ChwStatus } from '@/types/enums';

type CreateChwBody = {
  clinicId?: string;
  fullName?: string;
  email?: string;
  password?: string;
  phone?: string;
  villageArea?: string;
  status?: ChwStatus;
};

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

@Controller('chw-users')
@UseGuards(JwtAuthGuard)
export class ChwUsersController {
  constructor(
    private readonly accessService: AccessService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(ChwUser)
    private readonly chwRepo: Repository<ChwUser>,
    @InjectRepository(AuthUser)
    private readonly authUserRepo: Repository<AuthUser>,
  ) {}

  @Get()
  async listByClinic(
    @CurrentUser() auth: RequestUser,
    @Query('clinicId') clinicId?: string,
  ) {
    if (!clinicId) {
      throw new BadRequestException('clinicId is required');
    }

    const supervisorClinicId =
      await this.accessService.requireSupervisorClinicId(auth);

    if (supervisorClinicId !== clinicId) {
      return [];
    }

    const chws = await this.chwRepo.find({
      where: { clinicId },
      order: { fullName: 'ASC' },
    });

    return serializeDocs(chws);
  }

  @Post()
  async create(@CurrentUser() auth: RequestUser, @Body() body: CreateChwBody) {
    if (!body.clinicId || !body.fullName?.trim()) {
      throw new BadRequestException('clinicId and fullName are required');
    }

    const email = normalizeEmail(body.email);
    if (!email) {
      throw new BadRequestException('Enter a valid email address.');
    }

    if (!body.password || body.password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters.');
    }

    const supervisorClinicId =
      await this.accessService.requireSupervisorClinicId(auth);

    if (body.clinicId !== supervisorClinicId) {
      throw new ForbiddenException('CHWs can only be added to your clinic');
    }

    const supervisor = await this.accessService.getCurrentSupervisor(auth);
    if (!supervisor) {
      throw new ForbiddenException('Supervisor access required');
    }

    const existingUser = await this.authUserRepo.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('An account with this email already exists.');
    }

    const passwordHash = await hashPassword(body.password);

    const saved = await this.dataSource.transaction(async (manager) => {
      const user = await manager.save(
        manager.create(AuthUser, {
          email,
          name: body.fullName!.trim(),
        }),
      );

      await manager.save(
        manager.create(AuthAccount, {
          userId: user.id,
          passwordHash,
        }),
      );

      return manager.save(
        manager.create(ChwUser, {
          clinicId: body.clinicId!,
          supervisorId: supervisor.id,
          authUserId: user.id,
          fullName: body.fullName!.trim(),
          phone: body.phone,
          villageArea: body.villageArea,
          status: body.status ?? ChwStatus.ACTIVE,
        }),
      );
    });

    return serializeDoc(saved);
  }
}
