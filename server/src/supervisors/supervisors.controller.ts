import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AccessService } from '@/access/access.service';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import type { RequestUser } from '@/common/current-user.decorator';
import { CurrentUser } from '@/common/current-user.decorator';
import { serializeDocs } from '@/common/serialize.util';
import { Supervisor } from '@/entities/Supervisor';

@Controller('supervisors')
@UseGuards(JwtAuthGuard)
export class SupervisorsController {
  constructor(
    private readonly accessService: AccessService,
    @InjectRepository(Supervisor)
    private readonly supervisorRepo: Repository<Supervisor>,
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

    const supervisors = await this.supervisorRepo.find({
      where: { clinicId },
      order: { fullName: 'ASC' },
    });

    return serializeDocs(supervisors);
  }
}
