import { BadRequestException, Controller, Get, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AccessService } from '@/access/access.service';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import type { RequestUser } from '@/common/current-user.decorator';
import { CurrentUser } from '@/common/current-user.decorator';
import { serializeDoc, serializeDocs } from '@/common/serialize.util';
import { AntenatalVisit } from '@/entities/AntenatalVisit';
import { ChwUser } from '@/entities/ChwUser';
import { Clinic } from '@/entities/Clinic';
import { PatientCheckIn } from '@/entities/PatientCheckIn';
import { RiskFlag } from '@/entities/RiskFlag';
import { SmsLog } from '@/entities/SmsLog';
import { CheckInPeriod, FlagStatus, VisitStatus } from '@/types/enums';

function getTodayDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getCurrentPeriod(): CheckInPeriod {
  const hour = new Date().getHours();
  return hour < 14 ? CheckInPeriod.MORNING : CheckInPeriod.EVENING;
}

@Controller('patient-care')
@UseGuards(JwtAuthGuard)
export class PatientCareController {
  constructor(
    private readonly accessService: AccessService,
    @InjectRepository(Clinic)
    private readonly clinicRepo: Repository<Clinic>,
    @InjectRepository(ChwUser)
    private readonly chwRepo: Repository<ChwUser>,
    @InjectRepository(AntenatalVisit)
    private readonly visitRepo: Repository<AntenatalVisit>,
    @InjectRepository(PatientCheckIn)
    private readonly checkInRepo: Repository<PatientCheckIn>,
    @InjectRepository(RiskFlag)
    private readonly riskFlagRepo: Repository<RiskFlag>,
    @InjectRepository(SmsLog)
    private readonly smsRepo: Repository<SmsLog>,
  ) {}

  @Get()
  async getDashboard(@CurrentUser() auth: RequestUser) {
    const patient = await this.accessService.getCurrentPatient(auth);
    if (!patient) {
      throw new BadRequestException('Patient access required');
    }

    const today = getTodayDate();
    const currentPeriod = getCurrentPeriod();

    const [clinic, chw, visits, checkIns, openFlags, smsLogs, todayCheckIns] =
      await Promise.all([
        this.clinicRepo.findOne({ where: { id: patient.clinicId } }),
        this.chwRepo.findOne({ where: { id: patient.chwId } }),
        this.visitRepo.find({
          where: { patientId: patient.id },
          order: { scheduledDate: 'ASC' },
        }),
        this.checkInRepo.find({
          where: { patientId: patient.id },
          order: { checkInDate: 'DESC', period: 'DESC' },
          take: 7,
        }),
        this.riskFlagRepo.find({
          where: { patientId: patient.id, status: FlagStatus.OPEN },
          order: { flaggedAt: 'DESC' },
        }),
        this.smsRepo.find({
          where: { patientId: patient.id },
          order: { sentAt: 'DESC' },
          take: 5,
        }),
        this.checkInRepo.find({
          where: { patientId: patient.id, checkInDate: today },
        }),
      ]);

    const upcomingVisits = visits.filter(
      (visit) =>
        visit.status === VisitStatus.SCHEDULED &&
        visit.scheduledDate &&
        visit.scheduledDate >= today,
    );
    const nextVisit = upcomingVisits[0] ?? null;
    const morningDone = todayCheckIns.some(
      (entry) => entry.period === CheckInPeriod.MORNING,
    );
    const eveningDone = todayCheckIns.some(
      (entry) => entry.period === CheckInPeriod.EVENING,
    );

    return {
      patient: serializeDoc(patient),
      clinic: clinic ? serializeDoc(clinic) : null,
      chw: chw ? serializeDoc(chw) : null,
      nextVisit: nextVisit ? serializeDoc(nextVisit) : null,
      upcomingVisits: serializeDocs(upcomingVisits.slice(0, 3)),
      recentCheckIns: serializeDocs(checkIns),
      openFlags: serializeDocs(openFlags),
      recentMessages: serializeDocs(smsLogs),
      checkInStatus: {
        date: today,
        currentPeriod,
        morningDone,
        eveningDone,
        remindersEnabled: patient.checkInRemindersEnabled,
      },
      actions: [
        {
          id: 'check-in',
          label: 'Record how you feel',
          description: morningDone && eveningDone
            ? 'Both check-ins completed today'
            : `Complete your ${currentPeriod} check-in`,
          available: !(currentPeriod === CheckInPeriod.MORNING
            ? morningDone
            : eveningDone),
        },
        {
          id: 'raise-concern',
          label: 'Raise a concern',
          description: 'Alert your CHW or clinic about symptoms',
          available: true,
        },
        {
          id: 'visits',
          label: 'View antenatal visits',
          description: nextVisit?.scheduledDate
            ? `Next visit on ${nextVisit.scheduledDate}`
            : 'See your visit schedule',
          available: true,
        },
        {
          id: 'messages',
          label: 'Clinic messages',
          description: 'Appointment reminders and follow-ups',
          available: smsLogs.length > 0,
        },
        {
          id: 'pregnancy-info',
          label: 'Pregnancy details',
          description: patient.edd
            ? `Estimated delivery ${patient.edd}`
            : 'View EDD and gestational age',
          available: true,
        },
        {
          id: 'care-team',
          label: 'Your care team',
          description: chw?.fullName
            ? `Assigned CHW: ${chw.fullName}`
            : 'See who is supporting your care',
          available: true,
        },
        {
          id: 'resources',
          label: 'Health resources',
          description: 'Antenatal education and danger signs',
          available: true,
        },
      ],
    };
  }
}
