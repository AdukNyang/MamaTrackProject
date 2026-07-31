import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { CheckInMood, CheckInPeriod } from '@/types/enums';
import { Patient } from './Patient';

@Entity('patient_check_ins')
@Index('idx_patient_check_ins_patient', ['patientId'])
@Index('idx_patient_check_ins_date', ['checkInDate'])
@Index('UQ_patient_check_in_day_period', ['patientId', 'checkInDate', 'period'], {
  unique: true,
})
export class PatientCheckIn {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'patient_id', type: 'uuid' })
  patientId!: string;

  @Column({ name: 'check_in_date', type: 'date' })
  checkInDate!: string;

  @Column({ type: 'enum', enum: CheckInPeriod })
  period!: CheckInPeriod;

  @Column({ type: 'enum', enum: CheckInMood })
  mood!: CheckInMood;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient!: Patient;
}
