import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { PatientRiskLevel, PatientStatus } from '@/types/enums';
import { ChwUser } from './ChwUser';
import { Clinic } from './Clinic';

@Entity('patients')
@Index('idx_patients_chw', ['chwId'])
@Index('idx_patients_clinic', ['clinicId'])
@Index('idx_patients_risk_level', ['riskLevel'])
@Index('idx_patients_status', ['status'])
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'chw_id', type: 'uuid' })
  chwId!: string;

  @Column({ name: 'clinic_id', type: 'uuid' })
  clinicId!: string;

  @Column({ name: 'full_name', type: 'text' })
  fullName!: string;

  @Column({ type: 'text', nullable: true })
  phone?: string | null;

  @Column({ type: 'integer', nullable: true })
  age?: number | null;

  @Column({ type: 'text', nullable: true })
  village?: string | null;

  @Column({ type: 'date', nullable: true })
  lmp?: string | null;

  @Column({ type: 'date', nullable: true })
  edd?: string | null;

  @Column({ name: 'gestational_weeks', type: 'integer', nullable: true })
  gestationalWeeks?: number | null;

  @Column({ type: 'integer', nullable: true })
  gravida?: number | null;

  @Column({ type: 'integer', nullable: true })
  parity?: number | null;

  @Column({
    name: 'risk_level',
    type: 'enum',
    enum: PatientRiskLevel,
    default: PatientRiskLevel.LOW,
  })
  riskLevel!: PatientRiskLevel;

  @Column({
    type: 'enum',
    enum: PatientStatus,
    default: PatientStatus.ACTIVE,
  })
  status!: PatientStatus;

  @Column({ type: 'boolean', default: false })
  synced!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => ChwUser)
  @JoinColumn({ name: 'chw_id' })
  chw!: ChwUser;

  @ManyToOne(() => Clinic)
  @JoinColumn({ name: 'clinic_id' })
  clinic!: Clinic;
}
