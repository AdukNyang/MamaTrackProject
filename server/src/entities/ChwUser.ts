import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { ChwStatus } from '@/types/enums';
import { AuthUser } from './AuthUser';
import { Clinic } from './Clinic';
import { Supervisor } from './Supervisor';

@Entity('chw_users')
@Index('idx_chw_clinic', ['clinicId'])
@Index('idx_chw_supervisor', ['supervisorId'])
@Index('idx_chw_auth_user', ['authUserId'])
export class ChwUser {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'clinic_id', type: 'uuid' })
  clinicId!: string;

  @Column({ name: 'supervisor_id', type: 'uuid', nullable: true })
  supervisorId?: string | null;

  @Column({ name: 'auth_user_id', type: 'uuid', nullable: true, unique: true })
  authUserId?: string | null;

  @Column({ name: 'full_name', type: 'text' })
  fullName!: string;

  @Column({ type: 'text', nullable: true })
  phone?: string | null;

  @Column({ name: 'village_area', type: 'text', nullable: true })
  villageArea?: string | null;

  @Column({
    type: 'enum',
    enum: ChwStatus,
    default: ChwStatus.ACTIVE,
  })
  status!: ChwStatus;

  @Column({ name: 'last_sync_at', type: 'timestamptz', nullable: true })
  lastSyncAt?: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @ManyToOne(() => Clinic)
  @JoinColumn({ name: 'clinic_id' })
  clinic!: Clinic;

  @ManyToOne(() => Supervisor, { nullable: true })
  @JoinColumn({ name: 'supervisor_id' })
  supervisor?: Supervisor | null;

  @ManyToOne(() => AuthUser, { nullable: true })
  @JoinColumn({ name: 'auth_user_id' })
  authUser?: AuthUser | null;
}
