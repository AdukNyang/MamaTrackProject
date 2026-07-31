import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccessModule } from './access/access.module';
import { AntenatalVisitsModule } from './antenatal-visits/antenatal-visits.module';
import { AuthModule } from './auth/auth.module';
import { ChwUsersModule } from './chw-users/chw-users.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { entities } from './entities';
import { PatientCheckInsModule } from './patient-check-ins/patient-check-ins.module';
import { PatientCareModule } from './patient-care/patient-care.module';
import { PatientsModule } from './patients/patients.module';
import { RiskFlagsModule } from './risk-flags/risk-flags.module';
import { SmsLogsModule } from './sms-logs/sms-logs.module';
import { SupervisorsModule } from './supervisors/supervisors.module';
import { UsersModule } from './users/users.module';

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not set');
  }
  return url;
}

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: getDatabaseUrl(),
      ssl: process.env.DATABASE_URL?.includes('neon.tech')
        ? { rejectUnauthorized: false }
        : undefined,
      entities,
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',
    }),
    AuthModule,
    AccessModule,
    DashboardModule,
    UsersModule,
    PatientsModule,
    PatientCheckInsModule,
    PatientCareModule,
    ChwUsersModule,
    AntenatalVisitsModule,
    RiskFlagsModule,
    SmsLogsModule,
    SupervisorsModule,
  ],
})
export class AppModule {}
