import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccessModule } from '@/access/access.module';
import { AuthModule } from '@/auth/auth.module';
import { AntenatalVisit } from '@/entities/AntenatalVisit';
import { ChwUser } from '@/entities/ChwUser';

import { AntenatalVisitsController } from './antenatal-visits.controller';

@Module({
  imports: [
    AuthModule,
    AccessModule,
    TypeOrmModule.forFeature([AntenatalVisit, ChwUser]),
  ],
  controllers: [AntenatalVisitsController],
})
export class AntenatalVisitsModule {}
