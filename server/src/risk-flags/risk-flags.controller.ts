import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AccessService } from '@/access/access.service';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import type { RequestUser } from '@/common/current-user.decorator';
import { CurrentUser } from '@/common/current-user.decorator';
import { serializeDocs } from '@/common/serialize.util';
import { Patient } from '@/entities/Patient';
import { RiskFlag } from '@/entities/RiskFlag';
import { FlagStatus } from '@/types/enums';

@Controller('risk-flags')
@UseGuards(JwtAuthGuard)
export class RiskFlagsController {
  constructor(
    private readonly accessService: AccessService,
    @InjectRepository(RiskFlag)
    private readonly riskFlagRepo: Repository<RiskFlag>,
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
  ) {}

  @Get()
  async listForWorkspace(@CurrentUser() auth: RequestUser) {
    const supervisorClinicId =
      await this.accessService.getCurrentSupervisorClinicId(auth);
    const chw = await this.accessService.getCurrentChw(auth);

    if (supervisorClinicId) {
      const patients = await this.patientRepo.find({
        where: { clinicId: supervisorClinicId },
      });
      const patientIds = new Set(patients.map((patient) => patient.id));
      const flags = await this.riskFlagRepo.find({
        where: { status: FlagStatus.OPEN },
        order: { flaggedAt: 'DESC' },
      });

      return serializeDocs(
        flags.filter((flag) => patientIds.has(flag.patientId)),
      );
    }

    if (!chw) {
      return [];
    }

    const flags = await this.riskFlagRepo.find({
      where: { reportedBy: chw.id, status: FlagStatus.OPEN },
      order: { flaggedAt: 'DESC' },
    });

    return serializeDocs(flags);
  }
}
