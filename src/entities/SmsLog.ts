import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { SmsDeliveryStatus, SmsMessageType } from '@/types/enums';
import { AntenatalVisit } from './AntenatalVisit';
import { Patient } from './Patient';

@Entity('sms_logs')
@Index('idx_sms_logs_patient', ['patientId'])
@Index('idx_sms_logs_visit', ['visitId'])
@Index('idx_sms_logs_delivery_status', ['deliveryStatus'])
export class SmsLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'patient_id', type: 'uuid', nullable: true })
  patientId?: string | null;

  @Column({ name: 'visit_id', type: 'uuid', nullable: true })
  visitId?: string | null;

  @Column({ name: 'recipient_phone', type: 'text' })
  recipientPhone!: string;

  @Column({
    name: 'message_type',
    type: 'enum',
    enum: SmsMessageType,
    default: SmsMessageType.GENERAL,
  })
  messageType!: SmsMessageType;

  @Column({ name: 'message_body', type: 'text' })
  messageBody!: string;

  @Column({ name: 'africas_talking_id', type: 'text', nullable: true })
  africasTalkingId?: string | null;

  @Column({
    name: 'delivery_status',
    type: 'enum',
    enum: SmsDeliveryStatus,
    default: SmsDeliveryStatus.QUEUED,
  })
  deliveryStatus!: SmsDeliveryStatus;

  @Column({ name: 'sent_at', type: 'timestamptz', nullable: true })
  sentAt?: Date | null;

  @Column({ name: 'delivered_at', type: 'timestamptz', nullable: true })
  deliveredAt?: Date | null;

  @ManyToOne(() => Patient, { nullable: true })
  @JoinColumn({ name: 'patient_id' })
  patient?: Patient | null;

  @ManyToOne(() => AntenatalVisit, { nullable: true })
  @JoinColumn({ name: 'visit_id' })
  visit?: AntenatalVisit | null;
}
