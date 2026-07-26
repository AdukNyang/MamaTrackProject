import {
  BadRequestException,
  Body,
  Controller,
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
import { ChwUser } from '@/entities/ChwUser';
import { Patient } from '@/entities/Patient';
import { PatientRiskLevel, PatientStatus } from '@/types/enums';

type CreatePatientBody = {
  chwId?: string;
  fullName?: string;
  phone?: string;
  age?: number;
  village?: string;
  lmp?: string;
  edd?: string;
  gestationalWeeks?: number;
  gravida?: number;
  parity?: number;
  riskLevel?: PatientRiskLevel;
  status?: PatientStatus;
  synced?: boolean;
};

@Controller('patients')
@UseGuards(JwtAuthGuard)
export class PatientsController {
  constructor(
    private readonly accessService: AccessService,
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
    @InjectRepository(ChwUser)
    private readonly chwRepo: Repository<ChwUser>,
  ) {}

  @Get()
  async listForWorkspace(@CurrentUser() auth: RequestUser) {
    const supervisorClinicId =
      await this.accessService.getCurrentSupervisorClinicId(auth);
    const chw = await this.accessService.getCurrentChw(auth);

    if (supervisorClinicId) {
      const patients = await this.patientRepo.find({
        where: { clinicId: supervisorClinicId },
        order: { updatedAt: 'DESC' },
      });
      return serializeDocs(patients);
    }

    if (!chw) {
      return [];
    }

    const patients = await this.patientRepo.find({
      where: { chwId: chw.id },
      order: { updatedAt: 'DESC' },
    });

    return serializeDocs(patients);
  }

  @Post()
  async createBySupervisor(
    @CurrentUser() auth: RequestUser,
    @Body() body: CreatePatientBody,
  ) {
    if (!body.fullName?.trim()) {
      throw new BadRequestException('Full name is required');
    }

    if (!body.chwId) {
      throw new BadRequestException('CHW is required');
    }

    const clinicId = await this.accessService.requireSupervisorClinicId(auth);
    const chw = await this.chwRepo.findOne({ where: { id: body.chwId } });

    if (!chw || chw.clinicId !== clinicId) {
      throw new BadRequestException('CHW not found in your clinic');
    }

    const patient = this.patientRepo.create({
      chwId: body.chwId,
      clinicId,
      fullName: body.fullName.trim(),
      phone: body.phone,
      age: body.age,
      village: body.village,
      lmp: body.lmp,
      edd: body.edd,
      gestationalWeeks: body.gestationalWeeks,
      gravida: body.gravida,
      parity: body.parity,
      riskLevel: body.riskLevel ?? PatientRiskLevel.LOW,
      status: body.status ?? PatientStatus.ACTIVE,
      synced: body.synced ?? true,
    });

    const saved = await this.patientRepo.save(patient);
    return serializeDoc(saved);
  }
}
