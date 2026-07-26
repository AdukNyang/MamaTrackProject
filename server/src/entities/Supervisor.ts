import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { SupervisorRole } from '@/types/enums';
import { AuthUser } from './AuthUser';
import { Clinic } from './Clinic';

@Entity('supervisors')
@Index('idx_supervisors_clinic', ['clinicId'])
@Index('idx_supervisors_auth_user', ['authUserId'])
export class Supervisor {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'clinic_id', type: 'uuid' })
  clinicId!: string;

  @Column({ name: 'auth_user_id', type: 'uuid', unique: true })
  authUserId!: string;

  @Column({ name: 'full_name', type: 'text' })
  fullName!: string;

  @Column({ type: 'text', nullable: true })
  phone?: string | null;

  @Column({ type: 'text', nullable: true, unique: true })
  email?: string | null;

  @Column({
    type: 'enum',
    enum: SupervisorRole,
    default: SupervisorRole.CLINIC_SUPERVISOR,
  })
  role!: SupervisorRole;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @ManyToOne(() => Clinic)
  @JoinColumn({ name: 'clinic_id' })
  clinic!: Clinic;

  @ManyToOne(() => AuthUser)
  @JoinColumn({ name: 'auth_user_id' })
  authUser!: AuthUser;
}
