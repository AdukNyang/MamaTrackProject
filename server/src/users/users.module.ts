import { Module } from '@nestjs/common';

import { AccessModule } from '@/access/access.module';
import { AuthModule } from '@/auth/auth.module';

import { UsersController } from './users.controller';

@Module({
  imports: [AuthModule, AccessModule],
  controllers: [UsersController],
})
export class UsersModule {}
