import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChwUser } from '@/entities/ChwUser';
import { Supervisor } from '@/entities/Supervisor';

import { AccessService } from './access.service';

@Module({
  imports: [TypeOrmModule.forFeature([Supervisor, ChwUser])],
  providers: [AccessService],
  exports: [AccessService],
})
export class AccessModule {}
