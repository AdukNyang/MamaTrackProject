import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccessModule } from '@/access/access.module';
import { AuthModule } from '@/auth/auth.module';
import { PatientCheckIn } from '@/entities/PatientCheckIn';
import { RiskFlag } from '@/entities/RiskFlag';

import { PatientCheckInsController } from './patient-check-ins.controller';

@Module({
  imports: [
    AuthModule,
    AccessModule,
    TypeOrmModule.forFeature([PatientCheckIn, RiskFlag]),
  ],
  controllers: [PatientCheckInsController],
})
export class PatientCheckInsModule {}
