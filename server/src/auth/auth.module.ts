import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthAccount } from '@/entities/AuthAccount';
import { AuthSession } from '@/entities/AuthSession';
import { AuthUser } from '@/entities/AuthUser';
import { AuthVerificationCode } from '@/entities/AuthVerificationCode';

import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AuthUser,
      AuthAccount,
      AuthSession,
      AuthVerificationCode,
    ]),
  ],
  controllers: [AuthController],
  providers: [JwtAuthGuard],
  exports: [JwtAuthGuard, TypeOrmModule],
})
export class AuthModule {}
