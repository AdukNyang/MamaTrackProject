import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type { RequestUser } from '@/common/current-user.decorator';
import { ChwUser } from '@/entities/ChwUser';
import { Patient } from '@/entities/Patient';
import { Supervisor } from '@/entities/Supervisor';

@Injectable()
export class AccessService {
  constructor(
    @InjectRepository(Supervisor)
    private readonly supervisorRepo: Repository<Supervisor>,
    @InjectRepository(ChwUser)
    private readonly chwRepo: Repository<ChwUser>,
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
  ) {}

  getCurrentSupervisor(auth: RequestUser) {
    return this.supervisorRepo.findOne({
      where: { authUserId: auth.userId },
    });
  }

  async getCurrentSupervisorClinicId(auth: RequestUser) {
    const supervisor = await this.getCurrentSupervisor(auth);
    return supervisor?.clinicId ?? null;
  }

  getCurrentChw(auth: RequestUser) {
    return this.chwRepo.findOne({
      where: { authUserId: auth.userId },
    });
  }

  getCurrentPatient(auth: RequestUser) {
    return this.patientRepo.findOne({
      where: { authUserId: auth.userId },
    });
  }

  async requireSupervisorClinicId(auth: RequestUser) {
    const clinicId = await this.getCurrentSupervisorClinicId(auth);
    if (!clinicId) {
      throw new ForbiddenException('Supervisor access required');
    }
    return clinicId;
  }

  async requireCurrentChwId(auth: RequestUser) {
    const chw = await this.getCurrentChw(auth);
    if (!chw) {
      throw new ForbiddenException('CHW access required');
    }
    return chw.id;
  }

  async requireCurrentPatientId(auth: RequestUser) {
    const patient = await this.getCurrentPatient(auth);
    if (!patient) {
      throw new ForbiddenException('Patient access required');
    }
    return patient.id;
  }

  async canAccessPatient(
    auth: RequestUser,
    patient: Pick<Patient, 'id' | 'clinicId' | 'chwId'>,
  ) {
    const currentPatient = await this.getCurrentPatient(auth);
    if (currentPatient?.id === patient.id) {
      return true;
    }

    const supervisorClinicId = await this.getCurrentSupervisorClinicId(auth);
    if (supervisorClinicId && supervisorClinicId === patient.clinicId) {
      return true;
    }

    const chw = await this.getCurrentChw(auth);
    return chw?.id === patient.chwId;
  }

  async requirePatientAccess(auth: RequestUser, patientId: string) {
    const patient = await this.patientRepo.findOne({ where: { id: patientId } });
    if (!patient || !(await this.canAccessPatient(auth, patient))) {
      throw new ForbiddenException('Not authorized to access this patient');
    }
    return patient;
  }
}
