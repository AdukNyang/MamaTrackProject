import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { AccessService } from '@/access/access.service';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import type { RequestUser } from '@/common/current-user.decorator';
import { CurrentUser } from '@/common/current-user.decorator';
import { serializeDoc, serializeDocs } from '@/common/serialize.util';
import { AntenatalVisit } from '@/entities/AntenatalVisit';
import { ChwUser } from '@/entities/ChwUser';
import { Patient } from '@/entities/Patient';
import { VisitStatus } from '@/types/enums';

type ScheduleVisitBody = {
  patientId?: string;
  scheduledDate?: string;
  contactNumber?: number;
  notes?: string;
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

@Controller('antenatal-visits')
@UseGuards(JwtAuthGuard)
export class AntenatalVisitsController {
  constructor(
    private readonly accessService: AccessService,
    @InjectRepository(AntenatalVisit)
    private readonly visitRepo: Repository<AntenatalVisit>,
    @InjectRepository(ChwUser)
    private readonly chwRepo: Repository<ChwUser>,
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
  ) {}

  @Post()
  async scheduleForPatient(
    @CurrentUser() auth: RequestUser,
    @Body() body: ScheduleVisitBody,
  ) {
    const chwId = await this.accessService.requireCurrentChwId(auth);

    if (!body.patientId?.trim()) {
      throw new BadRequestException('Patient is required');
    }

    const scheduledDate = body.scheduledDate?.trim();
    if (!scheduledDate || !DATE_PATTERN.test(scheduledDate)) {
      throw new BadRequestException('Enter a valid scheduled date (YYYY-MM-DD).');
    }

    if (
      body.contactNumber !== undefined &&
      (!Number.isInteger(body.contactNumber) || body.contactNumber < 1)
    ) {
      throw new BadRequestException('Contact number must be a positive whole number.');
    }

    const patient = await this.patientRepo.findOne({
      where: { id: body.patientId.trim() },
    });

    if (!patient || patient.chwId !== chwId) {
      throw new BadRequestException('Patient not assigned to you.');
    }

    const visit = this.visitRepo.create({
      patientId: patient.id,
      chwId,
      contactNumber: body.contactNumber,
      scheduledDate,
      notes: body.notes?.trim() || undefined,
      status: VisitStatus.SCHEDULED,
      dangerSignsPresent: false,
      synced: true,
    });

    const saved = await this.visitRepo.save(visit);
    return serializeDoc(saved);
  }

  @Get()
  async listForWorkspace(@CurrentUser() auth: RequestUser) {
    const supervisorClinicId =
      await this.accessService.getCurrentSupervisorClinicId(auth);
    const chw = await this.accessService.getCurrentChw(auth);

    if (supervisorClinicId) {
      const chws = await this.chwRepo.find({
        where: { clinicId: supervisorClinicId },
      });
      const chwIds = chws.map((entry) => entry.id);
      const visits =
        chwIds.length === 0
          ? []
          : await this.visitRepo.find({
              where: { chwId: In(chwIds) },
              order: { updatedAt: 'DESC' },
            });

      return serializeDocs(visits);
    }

    const patient = await this.accessService.getCurrentPatient(auth);
    if (patient) {
      const visits = await this.visitRepo.find({
        where: { patientId: patient.id },
        order: { scheduledDate: 'ASC' },
      });
      return serializeDocs(visits);
    }

    if (!chw) {
      return [];
    }

    const visits = await this.visitRepo.find({
      where: { chwId: chw.id },
      order: { updatedAt: 'DESC' },
    });

    return serializeDocs(visits);
  }
}
