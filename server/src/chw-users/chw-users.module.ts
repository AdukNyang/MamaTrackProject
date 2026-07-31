import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccessModule } from '@/access/access.module';
import { AuthModule } from '@/auth/auth.module';
import { AuthAccount } from '@/entities/AuthAccount';
import { AuthUser } from '@/entities/AuthUser';
import { ChwUser } from '@/entities/ChwUser';

import { ChwUsersController } from './chw-users.controller';

@Module({
  imports: [
    AuthModule,
    AccessModule,
    TypeOrmModule.forFeature([ChwUser, AuthUser, AuthAccount]),
  ],
  controllers: [ChwUsersController],
})
export class ChwUsersModule {}
