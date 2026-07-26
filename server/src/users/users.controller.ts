import { Controller, Get, UseGuards } from '@nestjs/common';

import { AccessService } from '@/access/access.service';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import type { RequestUser } from '@/common/current-user.decorator';
import { CurrentUser } from '@/common/current-user.decorator';
import { serializeDoc } from '@/common/serialize.util';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly accessService: AccessService) {}

  @Get('viewer')
  async viewer(@CurrentUser() auth: RequestUser) {
    const [supervisor, chw] = await Promise.all([
      this.accessService.getCurrentSupervisor(auth),
      this.accessService.getCurrentChw(auth),
    ]);

    return {
      user: {
        email: auth.user.email,
        name: auth.user.name,
      },
      supervisor: supervisor ? serializeDoc(supervisor) : null,
      chw: chw ? serializeDoc(chw) : null,
      role: supervisor ? 'supervisor' : chw ? 'chw' : 'unlinked',
    };
  }
}
