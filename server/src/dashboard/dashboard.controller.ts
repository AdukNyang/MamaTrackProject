import { BadRequestException, Controller, Get, Query, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { AccessService } from '@/access/access.service';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import type { RequestUser } from '@/common/current-user.decorator';
import { CurrentUser } from '@/common/current-user.decorator';
import { serializeDoc } from '@/common/serialize.util';
import { AntenatalVisit } from '@/entities/AntenatalVisit';
import { ChwUser } from '@/entities/ChwUser';
import { Clinic } from '@/entities/Clinic';
import { Patient } from '@/entities/Patient';
import { RiskFlag } from '@/entities/RiskFlag';
import { FlagStatus, VisitStatus } from '@/types/enums';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(
    private readonly accessService: AccessService,
    @InjectRepository(Clinic)
    private readonly clinicRepo: Repository<Clinic>,
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
    @InjectRepository(ChwUser)
    private readonly chwRepo: Repository<ChwUser>,
    @InjectRepository(RiskFlag)
    private readonly riskFlagRepo: Repository<RiskFlag>,
    @InjectRepository(AntenatalVisit)
    private readonly visitRepo: Repository<AntenatalVisit>,
  ) {}

  @Get()
  async getDashboard(
    @CurrentUser() auth: RequestUser,
    @Query('resource') resource = 'workspace',
  ) {
    const [supervisor, chw, patient] = await Promise.all([
      this.accessService.getCurrentSupervisor(auth),
      this.accessService.getCurrentChw(auth),
      this.accessService.getCurrentPatient(auth),
    ]);

    const clinicId = supervisor?.clinicId ?? chw?.clinicId ?? patient?.clinicId ?? null;

    if (resource === 'workspace') {
      const clinic = clinicId
        ? await this.clinicRepo.findOne({ where: { id: clinicId } })
        : null;

      const role = supervisor
        ? 'supervisor'
        : chw
          ? 'chw'
          : patient
            ? 'patient'
            : 'unlinked';

      return {
        role,
        supervisor: supervisor ? serializeDoc(supervisor) : null,
        chw: chw ? serializeDoc(chw) : null,
        patient: patient ? serializeDoc(patient) : null,
        clinic: clinic ? serializeDoc(clinic) : null,
        clinicId,
      };
    }

    if (resource === 'overview' && patient) {
      throw new BadRequestException('Use /patient-care for patient dashboard');
    }

    if (resource === 'overview') {
      return this.getOverview(auth, chw);
    }

    if (resource === 'recent-activity') {
      return this.getRecentActivity(auth, chw);
    }

    throw new BadRequestException('Unknown dashboard resource');
  }

  private async getOverview(auth: RequestUser, chw: ChwUser | null) {
    const supervisorClinicId =
      await this.accessService.getCurrentSupervisorClinicId(auth);

    if (!supervisorClinicId && !chw) {
      return null;
    }

    if (supervisorClinicId) {
      const [patients, chws, openFlags] = await Promise.all([
        this.patientRepo.find({ where: { clinicId: supervisorClinicId } }),
        this.chwRepo.find({ where: { clinicId: supervisorClinicId } }),
        this.riskFlagRepo.find({ where: { status: FlagStatus.OPEN } }),
      ]);

      const patientIds = new Set(patients.map((patient) => patient.id));
      const clinicFlags = openFlags.filter((flag) =>
        patientIds.has(flag.patientId),
      );

      const chwIds = chws.map((entry) => entry.id);
      const visits =
        chwIds.length === 0
          ? []
          : await this.visitRepo.find({ where: { chwId: In(chwIds) } });

      return {
        patients: patients.length,
        chws: chws.length,
        openFlags: clinicFlags.length,
        scheduledVisits: visits.filter(
          (visit) => visit.status === VisitStatus.SCHEDULED,
        ).length,
      };
    }

    const [patients, visits, flags] = await Promise.all([
      this.patientRepo.find({ where: { chwId: chw!.id } }),
      this.visitRepo.find({ where: { chwId: chw!.id } }),
      this.riskFlagRepo.find({ where: { reportedBy: chw!.id } }),
    ]);

    return {
      patients: patients.length,
      chws: 1,
      openFlags: flags.filter((flag) => flag.status === FlagStatus.OPEN).length,
      scheduledVisits: visits.filter(
        (visit) => visit.status === VisitStatus.SCHEDULED,
      ).length,
    };
  }

  private async getRecentActivity(auth: RequestUser, chw: ChwUser | null) {
    const supervisorClinicId =
      await this.accessService.getCurrentSupervisorClinicId(auth);

    if (!supervisorClinicId && !chw) {
      return [];
    }

    const patients = supervisorClinicId
      ? await this.patientRepo.find({ where: { clinicId: supervisorClinicId } })
      : await this.patientRepo.find({ where: { chwId: chw!.id } });

    const patientMap = new Map(patients.map((patient) => [patient.id, patient]));

    const flags = supervisorClinicId
      ? (
          await this.riskFlagRepo.find({ where: { status: FlagStatus.OPEN } })
        ).filter((flag) => patientMap.has(flag.patientId))
      : await this.riskFlagRepo.find({
          where: { reportedBy: chw!.id, status: FlagStatus.OPEN },
        });

    let visits: AntenatalVisit[] = [];
    if (supervisorClinicId) {
      const chws = await this.chwRepo.find({
        where: { clinicId: supervisorClinicId },
      });
      const chwIds = chws.map((entry) => entry.id);
      visits =
        chwIds.length === 0
          ? []
          : await this.visitRepo.find({ where: { chwId: In(chwIds) } });
    } else {
      visits = await this.visitRepo.find({ where: { chwId: chw!.id } });
    }

    const activity = [
      ...visits
        .filter((visit) => visit.status === VisitStatus.SCHEDULED)
        .slice(0, 3)
        .map((visit) => {
          const patient = patientMap.get(visit.patientId);
          return {
            id: visit.id,
            title: patient?.fullName ?? 'Patient',
            subtitle: visit.scheduledDate
              ? `Visit scheduled for ${visit.scheduledDate}`
              : 'Antenatal visit scheduled',
            meta: 'Due',
          };
        }),
      ...flags.slice(0, 3).map((flag) => {
        const patient = patientMap.get(flag.patientId);
        return {
          id: flag.id,
          title: patient?.fullName ?? 'Patient',
          subtitle: flag.description ?? `${flag.flagType} flagged`,
          meta: 'Open',
        };
      }),
      ...visits
        .filter((visit) => visit.status === VisitStatus.COMPLETED)
        .slice(0, 2)
        .map((visit) => {
          const patient = patientMap.get(visit.patientId);
          return {
            id: visit.id,
            title: patient?.fullName ?? 'Patient',
            subtitle: 'Visit completed',
            meta: visit.synced ? 'Synced' : 'Done',
          };
        }),
    ];

    return activity.slice(0, 5);
  }
}
