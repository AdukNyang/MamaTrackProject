import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccessModule } from '@/access/access.module';
import { AuthModule } from '@/auth/auth.module';
import { AntenatalVisit } from '@/entities/AntenatalVisit';
import { ChwUser } from '@/entities/ChwUser';
import { Clinic } from '@/entities/Clinic';
import { Patient } from '@/entities/Patient';
import { RiskFlag } from '@/entities/RiskFlag';

import { DashboardController } from './dashboard.controller';

@Module({
  imports: [
    AuthModule,
    AccessModule,
    TypeOrmModule.forFeature([
      Clinic,
      Patient,
      ChwUser,
      RiskFlag,
      AntenatalVisit,
    ]),
  ],
  controllers: [DashboardController],
})
export class DashboardModule {}
