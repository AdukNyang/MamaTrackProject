import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
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
import { Patient } from '@/entities/Patient';
import { PatientRiskLevel, PatientStatus } from '@/types/enums';
import { hashPassword } from '@/lib/auth/crypto';

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

type CreatePatientAccountBody = {
  email?: string;
  password?: string;
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

@Controller('patients')
@UseGuards(JwtAuthGuard)
export class PatientsController {
  constructor(
    private readonly accessService: AccessService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
    @InjectRepository(ChwUser)
    private readonly chwRepo: Repository<ChwUser>,
    @InjectRepository(AuthUser)
    private readonly authUserRepo: Repository<AuthUser>,
  ) {}

  @Get('me')
  async getMyProfile(@CurrentUser() auth: RequestUser) {
    const patient = await this.accessService.getCurrentPatient(auth);
    if (!patient) {
      throw new BadRequestException('Patient profile not found');
    }

    const chw = await this.chwRepo.findOne({ where: { id: patient.chwId } });
    return {
      patient: serializeDoc(patient),
      chw: chw ? serializeDoc(chw) : null,
    };
  }

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

  @Post(':patientId/account')
  async createAccount(
    @CurrentUser() auth: RequestUser,
    @Param('patientId') patientId: string,
    @Body() body: CreatePatientAccountBody,
  ) {
    const email = normalizeEmail(body.email);
    if (!email) {
      throw new BadRequestException('Enter a valid email address.');
    }

    if (!body.password || body.password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters.');
    }

    const patient = await this.accessService.requirePatientAccess(auth, patientId);

    if (patient.authUserId) {
      throw new BadRequestException('This patient already has a login account.');
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
          name: patient.fullName,
        }),
      );

      await manager.save(
        manager.create(AuthAccount, {
          userId: user.id,
          passwordHash,
        }),
      );

      patient.authUserId = user.id;
      patient.email = email;
      patient.checkInRemindersEnabled = true;
      return manager.save(patient);
    });

    return serializeDoc(saved);
  }
}
