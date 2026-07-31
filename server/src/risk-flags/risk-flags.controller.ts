import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AccessService } from '@/access/access.service';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import type { RequestUser } from '@/common/current-user.decorator';
import { CurrentUser } from '@/common/current-user.decorator';
import { serializeDoc, serializeDocs } from '@/common/serialize.util';
import { AntenatalVisit } from '@/entities/AntenatalVisit';
import { Patient } from '@/entities/Patient';
import { RiskFlag } from '@/entities/RiskFlag';
import {
  FlagSeverity,
  FlagStatus,
  FlagType,
  RiskReporterType,
} from '@/types/enums';

type CreateRiskFlagBody = {
  patientId?: string;
  visitId?: string;
  flagType?: FlagType;
  severity?: FlagSeverity;
  description?: string;
};

const FLAG_TYPES = new Set<string>(Object.values(FlagType));
const FLAG_SEVERITIES = new Set<string>(Object.values(FlagSeverity));

@Controller('risk-flags')
@UseGuards(JwtAuthGuard)
export class RiskFlagsController {
  constructor(
    private readonly accessService: AccessService,
    @InjectRepository(RiskFlag)
    private readonly riskFlagRepo: Repository<RiskFlag>,
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
    @InjectRepository(AntenatalVisit)
    private readonly visitRepo: Repository<AntenatalVisit>,
  ) {}

  @Post()
  async createForPatient(
    @CurrentUser() auth: RequestUser,
    @Body() body: CreateRiskFlagBody,
  ) {
    const currentPatient = await this.accessService.getCurrentPatient(auth);
    const chw = await this.accessService.getCurrentChw(auth);

    if (!body.flagType || !FLAG_TYPES.has(body.flagType)) {
      throw new BadRequestException('Select a valid risk flag type.');
    }

    if (body.severity && !FLAG_SEVERITIES.has(body.severity)) {
      throw new BadRequestException('Select a valid severity level.');
    }

    if (currentPatient) {
      if (!body.description?.trim()) {
        throw new BadRequestException('Describe what you are experiencing.');
      }

      let visitId: string | undefined;
      if (body.visitId?.trim()) {
        const visit = await this.visitRepo.findOne({
          where: { id: body.visitId.trim() },
        });

        if (!visit || visit.patientId !== currentPatient.id) {
          throw new BadRequestException('Visit not found.');
        }

        visitId = visit.id;
      }

      const flag = this.riskFlagRepo.create({
        patientId: currentPatient.id,
        visitId,
        reporterType: RiskReporterType.PATIENT,
        flagType: body.flagType,
        severity: body.severity ?? FlagSeverity.MEDIUM,
        description: body.description.trim(),
        status: FlagStatus.OPEN,
        flaggedAt: new Date(),
        synced: true,
      });

      const saved = await this.riskFlagRepo.save(flag);
      return serializeDoc(saved);
    }

    if (!chw) {
      throw new ForbiddenException('CHW or patient access required');
    }

    if (!body.patientId?.trim()) {
      throw new BadRequestException('Patient is required');
    }

    const patient = await this.patientRepo.findOne({
      where: { id: body.patientId.trim() },
    });

    if (!patient || patient.chwId !== chw.id) {
      throw new BadRequestException('Patient not assigned to you.');
    }

    let visitId: string | undefined;
    if (body.visitId?.trim()) {
      const visit = await this.visitRepo.findOne({
        where: { id: body.visitId.trim() },
      });

      if (!visit || visit.patientId !== patient.id || visit.chwId !== chw.id) {
        throw new BadRequestException('Visit not found for this patient.');
      }

      visitId = visit.id;
    }

    const flag = this.riskFlagRepo.create({
      patientId: patient.id,
      visitId,
      reportedBy: chw.id,
      reporterType: RiskReporterType.CHW,
      flagType: body.flagType,
      severity: body.severity ?? FlagSeverity.MEDIUM,
      description: body.description?.trim() || undefined,
      status: FlagStatus.OPEN,
      flaggedAt: new Date(),
      synced: true,
    });

    const saved = await this.riskFlagRepo.save(flag);
    return serializeDoc(saved);
  }

  @Get()
  async listForWorkspace(@CurrentUser() auth: RequestUser) {
    const supervisorClinicId =
      await this.accessService.getCurrentSupervisorClinicId(auth);
    const chw = await this.accessService.getCurrentChw(auth);
    const patient = await this.accessService.getCurrentPatient(auth);

    if (patient) {
      const flags = await this.riskFlagRepo.find({
        where: { patientId: patient.id },
        order: { flaggedAt: 'DESC' },
      });
      return serializeDocs(flags);
    }

    if (supervisorClinicId) {
      const patients = await this.patientRepo.find({
        where: { clinicId: supervisorClinicId },
      });
      const patientIds = new Set(patients.map((entry) => entry.id));
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
