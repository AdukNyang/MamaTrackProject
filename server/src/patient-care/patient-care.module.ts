import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccessModule } from '@/access/access.module';
import { AuthModule } from '@/auth/auth.module';
import { AntenatalVisit } from '@/entities/AntenatalVisit';
import { ChwUser } from '@/entities/ChwUser';
import { Clinic } from '@/entities/Clinic';
import { PatientCheckIn } from '@/entities/PatientCheckIn';
import { RiskFlag } from '@/entities/RiskFlag';
import { SmsLog } from '@/entities/SmsLog';

import { PatientCareController } from './patient-care.controller';

@Module({
  imports: [
    AuthModule,
    AccessModule,
    TypeOrmModule.forFeature([
      Clinic,
      ChwUser,
      AntenatalVisit,
      PatientCheckIn,
      RiskFlag,
      SmsLog,
    ]),
  ],
  controllers: [PatientCareController],
})
export class PatientCareModule {}
