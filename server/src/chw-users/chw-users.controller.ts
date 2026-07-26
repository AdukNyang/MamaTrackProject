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
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AccessService } from '@/access/access.service';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import type { RequestUser } from '@/common/current-user.decorator';
import { CurrentUser } from '@/common/current-user.decorator';
import { serializeDoc, serializeDocs } from '@/common/serialize.util';
import { ChwUser } from '@/entities/ChwUser';
import { ChwStatus } from '@/types/enums';

type CreateChwBody = {
  clinicId?: string;
  supervisorId?: string;
  authUserId?: string;
  fullName?: string;
  phone?: string;
  villageArea?: string;
  status?: ChwStatus;
};

@Controller('chw-users')
@UseGuards(JwtAuthGuard)
export class ChwUsersController {
  constructor(
    private readonly accessService: AccessService,
    @InjectRepository(ChwUser)
    private readonly chwRepo: Repository<ChwUser>,
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

    const supervisorClinicId =
      await this.accessService.requireSupervisorClinicId(auth);

    if (body.clinicId !== supervisorClinicId) {
      throw new ForbiddenException('CHWs can only be added to your clinic');
    }

    const chw = this.chwRepo.create({
      clinicId: body.clinicId,
      supervisorId: body.supervisorId,
      authUserId: body.authUserId,
      fullName: body.fullName.trim(),
      phone: body.phone,
      villageArea: body.villageArea,
      status: body.status ?? ChwStatus.ACTIVE,
    });

    const saved = await this.chwRepo.save(chw);
    return serializeDoc(saved);
  }
}
