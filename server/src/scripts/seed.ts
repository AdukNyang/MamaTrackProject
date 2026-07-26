import { config } from 'dotenv';
import { resolve } from 'node:path';

config({ path: resolve(__dirname, '../../.env.local') });
config({ path: resolve(__dirname, '../.env.local') });

import 'reflect-metadata';

import { AntenatalVisit } from '@/entities/AntenatalVisit';
import { AuthAccount } from '@/entities/AuthAccount';
import { AuthUser } from '@/entities/AuthUser';
import { ChwUser } from '@/entities/ChwUser';
import { Clinic } from '@/entities/Clinic';
import { Patient } from '@/entities/Patient';
import { RiskFlag } from '@/entities/RiskFlag';
import { SmsLog } from '@/entities/SmsLog';
import { Supervisor } from '@/entities/Supervisor';
import { hashPassword } from '@/lib/auth/crypto';
import { AppDataSource } from '@/lib/data-source';
import {
  DEMO_CHWS,
  DEMO_CLINIC,
  DEMO_PATIENTS,
  DEMO_RISK_FLAGS,
  DEMO_SMS_LOGS,
  DEMO_VISITS,
} from '@/lib/seed-data';
import {
  ChwStatus,
  FlagSeverity,
  FlagStatus,
  FlagType,
  PatientRiskLevel,
  PatientStatus,
  SmsDeliveryStatus,
  SmsMessageType,
  SupervisorRole,
  VisitStatus,
} from '@/types/enums';

const SUPERVISOR_EMAIL = 'sam.dv.350@gmail.com';
const SUPERVISOR_NAME = 'Sam Supervisor';
const SUPERVISOR_PASSWORD = 'admin123';
const DAY_MS = 24 * 60 * 60 * 1000;

async function seedSupervisor() {
  const userRepo = AppDataSource.getRepository(AuthUser);
  const accountRepo = AppDataSource.getRepository(AuthAccount);
  const clinicRepo = AppDataSource.getRepository(Clinic);
  const supervisorRepo = AppDataSource.getRepository(Supervisor);

  let user = await userRepo.findOne({ where: { email: SUPERVISOR_EMAIL } });

  if (!user) {
    user = await userRepo.save(
      userRepo.create({
        email: SUPERVISOR_EMAIL,
        name: SUPERVISOR_NAME,
        emailVerifiedAt: new Date(),
      }),
    );

    await accountRepo.save(
      accountRepo.create({
        userId: user.id,
        passwordHash: await hashPassword(SUPERVISOR_PASSWORD),
      }),
    );
  }

  let supervisor = await supervisorRepo.findOne({
    where: { authUserId: user.id },
  });

  if (!supervisor) {
    const clinic = await clinicRepo.save(
      clinicRepo.create({
        ...DEMO_CLINIC,
      }),
    );

    supervisor = await supervisorRepo.save(
      supervisorRepo.create({
        clinicId: clinic.id,
        authUserId: user.id,
        fullName: SUPERVISOR_NAME,
        email: SUPERVISOR_EMAIL,
        phone: '+2348019988776',
        role: SupervisorRole.ADMIN,
        isActive: true,
      }),
    );
  }

  return {
    userId: user.id,
    supervisorId: supervisor.id,
    clinicId: supervisor.clinicId,
  };
}

async function seedDemo(clinicId: string, supervisorId: string) {
  const patientRepo = AppDataSource.getRepository(Patient);
  const existing = await patientRepo.findOne({ where: { clinicId } });

  if (existing) {
    console.log('Demo data already seeded');
    return;
  }

  const now = Date.now();
  const chwRepo = AppDataSource.getRepository(ChwUser);
  const visitRepo = AppDataSource.getRepository(AntenatalVisit);
  const flagRepo = AppDataSource.getRepository(RiskFlag);
  const smsRepo = AppDataSource.getRepository(SmsLog);

  const chwIds: string[] = [];

  for (const chw of DEMO_CHWS) {
    const saved = await chwRepo.save(
      chwRepo.create({
        clinicId,
        supervisorId,
        fullName: chw.fullName,
        phone: chw.phone,
        villageArea: chw.villageArea,
        status: chw.status as ChwStatus,
        lastSyncAt: new Date(now - DAY_MS),
        createdAt: new Date(now - 30 * DAY_MS),
      }),
    );
    chwIds.push(saved.id);
  }

  const patientIds = new Map<string, string>();

  for (const patient of DEMO_PATIENTS) {
    const saved = await patientRepo.save(
      patientRepo.create({
        chwId: chwIds[patient.chwIndex],
        clinicId,
        fullName: patient.fullName,
        phone: patient.phone,
        age: patient.age,
        village: patient.village,
        lmp: patient.lmp,
        edd: patient.edd,
        gestationalWeeks: patient.gestationalWeeks,
        gravida: patient.gravida,
        parity: patient.parity,
        riskLevel: patient.riskLevel as PatientRiskLevel,
        status: patient.status as PatientStatus,
        synced: true,
        createdAt: new Date(now - 14 * DAY_MS),
        updatedAt: new Date(now - DAY_MS),
      }),
    );
    patientIds.set(patient.key, saved.id);
  }

  const visitIds = new Map<string, string>();

  for (const visit of DEMO_VISITS) {
    const patient = DEMO_PATIENTS.find((entry) => entry.key === visit.patientKey);
    if (!patient) continue;

    const patientId = patientIds.get(visit.patientKey);
    if (!patientId) continue;

    const saved = await visitRepo.save(
      visitRepo.create({
        patientId,
        chwId: chwIds[patient.chwIndex],
        contactNumber: visit.contactNumber,
        scheduledDate: visit.scheduledDate,
        completedDate: 'completedDate' in visit ? visit.completedDate : undefined,
        bpSystolic: 'bpSystolic' in visit ? visit.bpSystolic : undefined,
        bpDiastolic: 'bpDiastolic' in visit ? visit.bpDiastolic : undefined,
        weightKg:
          'weightKg' in visit && visit.weightKg !== undefined
            ? String(visit.weightKg)
            : undefined,
        fundalHeightCm: 'fundalHeightCm' in visit ? visit.fundalHeightCm : undefined,
        fetalHeartRate: 'fetalHeartRate' in visit ? visit.fetalHeartRate : undefined,
        dangerSignsPresent: visit.dangerSignsPresent,
        notes: visit.notes,
        status: visit.status as VisitStatus,
        synced: true,
        createdAt: new Date(now - 7 * DAY_MS),
        updatedAt: new Date(now - DAY_MS),
      }),
    );
    visitIds.set(visit.patientKey, saved.id);
  }

  for (const flag of DEMO_RISK_FLAGS) {
    const patient = DEMO_PATIENTS.find((entry) => entry.key === flag.patientKey);
    if (!patient) continue;

    const patientId = patientIds.get(flag.patientKey);
    if (!patientId) continue;

    const visitId =
      'visitPatientKey' in flag && flag.visitPatientKey
        ? visitIds.get(flag.visitPatientKey)
        : undefined;

    const flaggedAt = new Date(now - 2 * DAY_MS);
    const isResolved = flag.status === 'resolved';

    await flagRepo.save(
      flagRepo.create({
        patientId,
        visitId,
        reportedBy: chwIds[patient.chwIndex],
        resolvedBy: isResolved ? supervisorId : undefined,
        flagType: flag.flagType as FlagType,
        severity: flag.severity as FlagSeverity,
        description: flag.description,
        status: flag.status as FlagStatus,
        flaggedAt,
        resolvedAt: isResolved ? new Date(now - DAY_MS) : undefined,
        resolutionNotes:
          'resolutionNotes' in flag ? flag.resolutionNotes : undefined,
        synced: true,
        updatedAt: new Date(now - DAY_MS),
      }),
    );
  }

  for (const sms of DEMO_SMS_LOGS) {
    const patientId = patientIds.get(sms.patientKey);
    if (!patientId) continue;

    const patient = DEMO_PATIENTS.find((entry) => entry.key === sms.patientKey);
    const visitId =
      'visitPatientKey' in sms && sms.visitPatientKey
        ? visitIds.get(sms.visitPatientKey)
        : undefined;

    const sentAt =
      sms.deliveryStatus === 'queued' ? undefined : new Date(now - 12 * 60 * 60 * 1000);

    await smsRepo.save(
      smsRepo.create({
        patientId,
        visitId,
        recipientPhone: patient?.phone ?? '+2348000000000',
        messageType: sms.messageType as SmsMessageType,
        messageBody: sms.messageBody,
        africasTalkingId:
          'africasTalkingId' in sms ? sms.africasTalkingId : undefined,
        deliveryStatus: sms.deliveryStatus as SmsDeliveryStatus,
        sentAt,
        deliveredAt:
          sms.deliveryStatus === 'delivered'
            ? new Date(now - 11 * 60 * 60 * 1000)
            : undefined,
      }),
    );
  }

  console.log('Demo data seeded');
}

async function main() {
  await AppDataSource.initialize();
  const supervisor = await seedSupervisor();
  console.log('Supervisor seeded:', supervisor);

  if (process.argv.includes('--all')) {
    await seedDemo(supervisor.clinicId, supervisor.supervisorId);
  }

  await AppDataSource.destroy();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
