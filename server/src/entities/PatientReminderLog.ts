import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { PatientReminderType } from '@/types/enums';
import { Patient } from './Patient';

@Entity('patient_reminder_logs')
@Index('idx_patient_reminder_logs_patient', ['patientId'])
@Index('idx_patient_reminder_logs_sent_at', ['sentAt'])
export class PatientReminderLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'patient_id', type: 'uuid' })
  patientId!: string;

  @Column({ name: 'reminder_type', type: 'enum', enum: PatientReminderType })
  reminderType!: PatientReminderType;

  @Column({ type: 'text' })
  email!: string;

  @CreateDateColumn({ name: 'sent_at', type: 'timestamptz' })
  sentAt!: Date;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient!: Patient;
}
