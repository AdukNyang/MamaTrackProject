import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChwUser } from '@/entities/ChwUser';
import { Patient } from '@/entities/Patient';
import { Supervisor } from '@/entities/Supervisor';

import { AccessService } from './access.service';

@Module({
  imports: [TypeOrmModule.forFeature([Supervisor, ChwUser, Patient])],
  providers: [AccessService],
  exports: [AccessService],
})
export class AccessModule {}
