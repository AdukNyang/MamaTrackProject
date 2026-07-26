import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccessModule } from '@/access/access.module';
import { AuthModule } from '@/auth/auth.module';
import { ChwUser } from '@/entities/ChwUser';
import { Patient } from '@/entities/Patient';

import { PatientsController } from './patients.controller';

@Module({
  imports: [
    AuthModule,
    AccessModule,
    TypeOrmModule.forFeature([Patient, ChwUser]),
  ],
  controllers: [PatientsController],
})
export class PatientsModule {}
