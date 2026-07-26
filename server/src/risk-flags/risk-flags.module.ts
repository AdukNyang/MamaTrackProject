import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccessModule } from '@/access/access.module';
import { AuthModule } from '@/auth/auth.module';
import { Patient } from '@/entities/Patient';
import { RiskFlag } from '@/entities/RiskFlag';

import { RiskFlagsController } from './risk-flags.controller';

@Module({
  imports: [
    AuthModule,
    AccessModule,
    TypeOrmModule.forFeature([RiskFlag, Patient]),
  ],
  controllers: [RiskFlagsController],
})
export class RiskFlagsModule {}
