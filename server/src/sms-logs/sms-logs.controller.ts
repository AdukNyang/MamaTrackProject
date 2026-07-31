import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AccessService } from '@/access/access.service';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import type { RequestUser } from '@/common/current-user.decorator';
import { CurrentUser } from '@/common/current-user.decorator';
import { serializeDocs } from '@/common/serialize.util';
import { Patient } from '@/entities/Patient';
import { SmsLog } from '@/entities/SmsLog';

@Controller('sms-logs')
@UseGuards(JwtAuthGuard)
export class SmsLogsController {
  constructor(
    private readonly accessService: AccessService,
    @InjectRepository(SmsLog)
    private readonly smsLogRepo: Repository<SmsLog>,
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
  ) {}

  @Get()
  async listForWorkspace(@CurrentUser() auth: RequestUser) {
    const supervisorClinicId =
      await this.accessService.getCurrentSupervisorClinicId(auth);
    const chw = await this.accessService.getCurrentChw(auth);
    const patient = await this.accessService.getCurrentPatient(auth);

    if (patient) {
      const logs = await this.smsLogRepo.find({
        where: { patientId: patient.id },
        order: { sentAt: 'DESC' },
      });
      return serializeDocs(logs);
    }

    const patients = supervisorClinicId
      ? await this.patientRepo.find({
          where: { clinicId: supervisorClinicId },
        })
      : chw
        ? await this.patientRepo.find({ where: { chwId: chw.id } })
        : [];

    if (patients.length === 0) {
      return [];
    }

    const patientIds = new Set(patients.map((patient) => patient.id));
    const logs = await this.smsLogRepo.find({ order: { sentAt: 'DESC' } });

    return serializeDocs(
      logs.filter(
        (log): log is SmsLog & { patientId: string } =>
          log.patientId !== null &&
          log.patientId !== undefined &&
          patientIds.has(log.patientId),
      ),
    );
  }
}
