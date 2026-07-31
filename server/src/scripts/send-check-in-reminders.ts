import { config } from 'dotenv';
import { resolve } from 'node:path';

config({ path: resolve(__dirname, '../../.env.local') });
config({ path: resolve(__dirname, '../.env.local') });

import 'reflect-metadata';

import { MoreThanOrEqual } from 'typeorm';

import { PatientCheckIn } from '@/entities/PatientCheckIn';
import { PatientReminderLog } from '@/entities/PatientReminderLog';
import { Patient } from '@/entities/Patient';
import { sendCheckInReminderEmail } from '@/lib/auth/email';
import { AppDataSource } from '@/lib/data-source';
import { CheckInPeriod, PatientReminderType } from '@/types/enums';

function getTodayDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getReminderWindowStart(): Date {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return start;
}

async function sendPeriodReminders(period: CheckInPeriod) {
  const patientRepo = AppDataSource.getRepository(Patient);
  const checkInRepo = AppDataSource.getRepository(PatientCheckIn);
  const reminderRepo = AppDataSource.getRepository(PatientReminderLog);

  const today = getTodayDate();
  const reminderType =
    period === CheckInPeriod.MORNING
      ? PatientReminderType.CHECK_IN_MORNING
      : PatientReminderType.CHECK_IN_EVENING;

  const patients = await patientRepo.find({
    where: {
      checkInRemindersEnabled: true,
    },
  });

  const eligiblePatients = patients.filter(
    (patient) => patient.authUserId && patient.email,
  );

  let sent = 0;

  for (const patient of eligiblePatients) {
    const existingCheckIn = await checkInRepo.findOne({
      where: {
        patientId: patient.id,
        checkInDate: today,
        period,
      },
    });

    if (existingCheckIn) {
      continue;
    }

    const alreadySent = await reminderRepo.findOne({
      where: {
        patientId: patient.id,
        reminderType,
        sentAt: MoreThanOrEqual(getReminderWindowStart()),
      },
    });

    if (alreadySent) {
      continue;
    }

    await sendCheckInReminderEmail(patient.email!, patient.fullName, period);
    await reminderRepo.save(
      reminderRepo.create({
        patientId: patient.id,
        reminderType,
        email: patient.email!,
      }),
    );
    sent += 1;
  }

  return sent;
}

async function main() {
  const periodArg = process.argv[2];
  const period =
    periodArg === 'evening' ? CheckInPeriod.EVENING : CheckInPeriod.MORNING;

  await AppDataSource.initialize();
  const sent = await sendPeriodReminders(period);
  console.log(`Sent ${sent} ${period} check-in reminder(s).`);
  await AppDataSource.destroy();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
