import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccessModule } from '@/access/access.module';
import { AuthModule } from '@/auth/auth.module';
import { Patient } from '@/entities/Patient';
import { SmsLog } from '@/entities/SmsLog';

import { SmsLogsController } from './sms-logs.controller';

@Module({
  imports: [
    AuthModule,
    AccessModule,
    TypeOrmModule.forFeature([SmsLog, Patient]),
  ],
  controllers: [SmsLogsController],
})
export class SmsLogsModule {}
