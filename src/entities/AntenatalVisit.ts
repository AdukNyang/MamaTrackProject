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

import { VisitStatus } from '@/types/enums';
import { ChwUser } from './ChwUser';
import { Patient } from './Patient';

@Entity('antenatal_visits')
@Index('idx_visits_patient', ['patientId'])
@Index('idx_visits_chw', ['chwId'])
@Index('idx_visits_status', ['status'])
@Index('idx_visits_scheduled_date', ['scheduledDate'])
export class AntenatalVisit {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'patient_id', type: 'uuid' })
  patientId!: string;

  @Column({ name: 'chw_id', type: 'uuid' })
  chwId!: string;

  @Column({ name: 'contact_number', type: 'integer', nullable: true })
  contactNumber?: number | null;

  @Column({ name: 'scheduled_date', type: 'date', nullable: true })
  scheduledDate?: string | null;

  @Column({ name: 'completed_date', type: 'date', nullable: true })
  completedDate?: string | null;

  @Column({ name: 'bp_systolic', type: 'integer', nullable: true })
  bpSystolic?: number | null;

  @Column({ name: 'bp_diastolic', type: 'integer', nullable: true })
  bpDiastolic?: number | null;

  @Column({ name: 'weight_kg', type: 'numeric', precision: 5, scale: 2, nullable: true })
  weightKg?: string | null;

  @Column({ name: 'fundal_height_cm', type: 'integer', nullable: true })
  fundalHeightCm?: number | null;

  @Column({ name: 'fetal_heart_rate', type: 'text', nullable: true })
  fetalHeartRate?: string | null;

  @Column({ name: 'danger_signs_present', type: 'boolean', default: false })
  dangerSignsPresent!: boolean;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @Column({
    type: 'enum',
    enum: VisitStatus,
    default: VisitStatus.SCHEDULED,
  })
  status!: VisitStatus;

  @Column({ type: 'boolean', default: false })
  synced!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient!: Patient;

  @ManyToOne(() => ChwUser)
  @JoinColumn({ name: 'chw_id' })
  chw!: ChwUser;
}
