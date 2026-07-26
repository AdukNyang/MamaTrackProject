import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('clinics')
@Index('idx_clinics_state_lga', ['state', 'lga'])
export class Clinic {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'text', nullable: true })
  lga?: string | null;

  @Column({ type: 'text', nullable: true })
  state?: string | null;

  @Column({ name: 'contact_phone', type: 'text', nullable: true })
  contactPhone?: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
