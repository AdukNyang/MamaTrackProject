import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccessModule } from '@/access/access.module';
import { AuthModule } from '@/auth/auth.module';
import { AuthAccount } from '@/entities/AuthAccount';
import { AuthUser } from '@/entities/AuthUser';
import { ChwUser } from '@/entities/ChwUser';
import { Patient } from '@/entities/Patient';

import { PatientsController } from './patients.controller';

@Module({
  imports: [
    AuthModule,
    AccessModule,
    TypeOrmModule.forFeature([Patient, ChwUser, AuthUser, AuthAccount]),
  ],
  controllers: [PatientsController],
})
export class PatientsModule {}
