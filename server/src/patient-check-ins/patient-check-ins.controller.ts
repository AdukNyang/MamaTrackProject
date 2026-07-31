import {
  BadRequestException,
  Body,
  Controller,
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
import { PatientCheckIn } from '@/entities/PatientCheckIn';
import { RiskFlag } from '@/entities/RiskFlag';
import {
  CheckInMood,
  CheckInPeriod,
  FlagSeverity,
  FlagStatus,
  FlagType,
  RiskReporterType,
} from '@/types/enums';

type CreateCheckInBody = {
  period?: CheckInPeriod;
  mood?: CheckInMood;
  notes?: string;
  checkInDate?: string;
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MOODS = new Set<string>(Object.values(CheckInMood));
const PERIODS = new Set<string>(Object.values(CheckInPeriod));

function getTodayDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

@Controller('patient-check-ins')
@UseGuards(JwtAuthGuard)
export class PatientCheckInsController {
  constructor(
    private readonly accessService: AccessService,
    @InjectRepository(PatientCheckIn)
    private readonly checkInRepo: Repository<PatientCheckIn>,
    @InjectRepository(RiskFlag)
    private readonly riskFlagRepo: Repository<RiskFlag>,
  ) {}

  @Get()
  async listCheckIns(
    @CurrentUser() auth: RequestUser,
    @Query('patientId') patientId?: string,
  ) {
    const currentPatient = await this.accessService.getCurrentPatient(auth);

    if (currentPatient) {
      const checkIns = await this.checkInRepo.find({
        where: { patientId: currentPatient.id },
        order: { checkInDate: 'DESC', period: 'DESC' },
        take: 30,
      });
      return serializeDocs(checkIns);
    }

    if (!patientId) {
      throw new BadRequestException('patientId is required');
    }

    await this.accessService.requirePatientAccess(auth, patientId);
    const checkIns = await this.checkInRepo.find({
      where: { patientId },
      order: { checkInDate: 'DESC', period: 'DESC' },
      take: 30,
    });
    return serializeDocs(checkIns);
  }

  @Post()
  async recordCheckIn(
    @CurrentUser() auth: RequestUser,
    @Body() body: CreateCheckInBody,
  ) {
    const patientId = await this.accessService.requireCurrentPatientId(auth);

    if (!body.period || !PERIODS.has(body.period)) {
      throw new BadRequestException('Select morning or evening check-in.');
    }

    if (!body.mood || !MOODS.has(body.mood)) {
      throw new BadRequestException('Select how you are feeling today.');
    }

    const checkInDate = body.checkInDate?.trim() || getTodayDate();
    if (!DATE_PATTERN.test(checkInDate)) {
      throw new BadRequestException('Enter a valid check-in date (YYYY-MM-DD).');
    }

    const existing = await this.checkInRepo.findOne({
      where: { patientId, checkInDate, period: body.period },
    });

    if (existing) {
      throw new BadRequestException('You already recorded this check-in for today.');
    }

    const checkIn = this.checkInRepo.create({
      patientId,
      checkInDate,
      period: body.period,
      mood: body.mood,
      notes: body.notes?.trim() || undefined,
    });

    const saved = await this.checkInRepo.save(checkIn);

    if (body.mood === CheckInMood.UNWELL || body.mood === CheckInMood.CONCERNING) {
      await this.riskFlagRepo.save(
        this.riskFlagRepo.create({
          patientId,
          reporterType: RiskReporterType.PATIENT,
          flagType: FlagType.OTHER,
          severity:
            body.mood === CheckInMood.CONCERNING
              ? FlagSeverity.HIGH
              : FlagSeverity.MEDIUM,
          description:
            body.notes?.trim() ||
            `Patient reported feeling ${body.mood} during ${body.period} check-in.`,
          status: FlagStatus.OPEN,
          flaggedAt: new Date(),
          synced: true,
        }),
      );
    }

    return serializeDoc(saved);
  }
}
