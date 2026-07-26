import { AuthAccount } from './AuthAccount';
import { AuthSession } from './AuthSession';
import { AuthUser } from './AuthUser';
import { AuthVerificationCode } from './AuthVerificationCode';
import { AntenatalVisit } from './AntenatalVisit';
import { ChwUser } from './ChwUser';
import { Clinic } from './Clinic';
import { Patient } from './Patient';
import { RiskFlag } from './RiskFlag';
import { SmsLog } from './SmsLog';
import { Supervisor } from './Supervisor';

export const entities = [
  AuthUser,
  AuthAccount,
  AuthSession,
  AuthVerificationCode,
  Clinic,
  Supervisor,
  ChwUser,
  Patient,
  AntenatalVisit,
  RiskFlag,
  SmsLog,
];
