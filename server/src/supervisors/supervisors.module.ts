import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccessModule } from '@/access/access.module';
import { AuthModule } from '@/auth/auth.module';
import { Supervisor } from '@/entities/Supervisor';

import { SupervisorsController } from './supervisors.controller';

@Module({
  imports: [
    AuthModule,
    AccessModule,
    TypeOrmModule.forFeature([Supervisor]),
  ],
  controllers: [SupervisorsController],
})
export class SupervisorsModule {}
