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

import { FlagSeverity, FlagStatus, FlagType, RiskReporterType } from '@/types/enums';
import { AntenatalVisit } from './AntenatalVisit';
import { ChwUser } from './ChwUser';
import { Patient } from './Patient';
import { Supervisor } from './Supervisor';

@Entity('risk_flags')
@Index('idx_risk_flags_patient', ['patientId'])
@Index('idx_risk_flags_visit', ['visitId'])
@Index('idx_risk_flags_reported_by', ['reportedBy'])
@Index('idx_risk_flags_resolved_by', ['resolvedBy'])
@Index('idx_risk_flags_status', ['status'])
@Index('idx_risk_flags_severity', ['severity'])
@Index('idx_risk_flags_reporter_type', ['reporterType'])
export class RiskFlag {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'patient_id', type: 'uuid' })
  patientId!: string;

  @Column({ name: 'visit_id', type: 'uuid', nullable: true })
  visitId?: string | null;

  @Column({ name: 'reported_by', type: 'uuid', nullable: true })
  reportedBy?: string | null;

  @Column({
    name: 'reporter_type',
    type: 'enum',
    enum: RiskReporterType,
    default: RiskReporterType.CHW,
  })
  reporterType!: RiskReporterType;

  @Column({ name: 'resolved_by', type: 'uuid', nullable: true })
  resolvedBy?: string | null;

  @Column({ name: 'flag_type', type: 'enum', enum: FlagType })
  flagType!: FlagType;

  @Column({
    type: 'enum',
    enum: FlagSeverity,
    default: FlagSeverity.MEDIUM,
  })
  severity!: FlagSeverity;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({
    type: 'enum',
    enum: FlagStatus,
    default: FlagStatus.OPEN,
  })
  status!: FlagStatus;

  @Column({ name: 'flagged_at', type: 'timestamptz' })
  flaggedAt!: Date;

  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolvedAt?: Date | null;

  @Column({ name: 'resolution_notes', type: 'text', nullable: true })
  resolutionNotes?: string | null;

  @Column({ type: 'boolean', default: false })
  synced!: boolean;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient!: Patient;

  @ManyToOne(() => AntenatalVisit, { nullable: true })
  @JoinColumn({ name: 'visit_id' })
  visit?: AntenatalVisit | null;

  @ManyToOne(() => ChwUser, { nullable: true })
  @JoinColumn({ name: 'reported_by' })
  reportedByChw?: ChwUser | null;

  @ManyToOne(() => Supervisor, { nullable: true })
  @JoinColumn({ name: 'resolved_by' })
  resolvedBySupervisor?: Supervisor | null;
}
