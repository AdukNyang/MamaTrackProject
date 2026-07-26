import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { AccessService } from '@/access/access.service';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import type { RequestUser } from '@/common/current-user.decorator';
import { CurrentUser } from '@/common/current-user.decorator';
import { serializeDocs } from '@/common/serialize.util';
import { AntenatalVisit } from '@/entities/AntenatalVisit';
import { ChwUser } from '@/entities/ChwUser';

@Controller('antenatal-visits')
@UseGuards(JwtAuthGuard)
export class AntenatalVisitsController {
  constructor(
    private readonly accessService: AccessService,
    @InjectRepository(AntenatalVisit)
    private readonly visitRepo: Repository<AntenatalVisit>,
    @InjectRepository(ChwUser)
    private readonly chwRepo: Repository<ChwUser>,
  ) {}

  @Get()
  async listForWorkspace(@CurrentUser() auth: RequestUser) {
    const supervisorClinicId =
      await this.accessService.getCurrentSupervisorClinicId(auth);
    const chw = await this.accessService.getCurrentChw(auth);

    if (supervisorClinicId) {
      const chws = await this.chwRepo.find({
        where: { clinicId: supervisorClinicId },
      });
      const chwIds = chws.map((entry) => entry.id);
      const visits =
        chwIds.length === 0
          ? []
          : await this.visitRepo.find({
              where: { chwId: In(chwIds) },
              order: { updatedAt: 'DESC' },
            });

      return serializeDocs(visits);
    }

    if (!chw) {
      return [];
    }

    const visits = await this.visitRepo.find({
      where: { chwId: chw.id },
      order: { updatedAt: 'DESC' },
    });

    return serializeDocs(visits);
  }
}
