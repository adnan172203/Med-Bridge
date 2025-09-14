import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
  BeforeInsert,
} from 'typeorm';
// import { Patient } from './patient.entity';
// import { Doctor } from './doctor.entity';

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ===== CORE FIELDS =====
  // @ManyToOne(() => Patient, (patient) => patient.appointments)
  // patient: Patient;

  // @ManyToOne(() => Doctor)
  // doctor: Doctor;

  @Column({
    type: 'timestamptz',
    comment: 'Start time in clinic timezone',
  })
  startTime: Date;

  @Column({ type: 'timestamptz' })
  endTime: Date;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'scheduled',
  })
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';

  @Column({
    type: 'varchar',
    nullable: true,
    comment: 'WA Health-specific codes',
  })
  billingCode?: string;

  // ===== TELEHEALTH SPECIFICS =====
  @Column({ default: true })
  isVirtual: boolean;

  @Column({ nullable: true })
  videoCallUrl?: string;

  @Column({ type: 'jsonb', nullable: true })
  deviceCheck: {
    browser: string;
    os: string;
    ipAddress: string;
  };

  // ===== CLINICAL CONTEXT =====
  @Column({ type: 'text', nullable: true })
  reason?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'jsonb', nullable: true })
  preAppointmentQuestions?: Record<string, string>;

  // ===== WA COMPLIANCE =====
  @Column({
    type: 'boolean',
    default: false,
    comment: 'For indigenous health reporting',
  })
  requiresInterpreter: boolean;

  @Column({ nullable: true })
  medicareRebateId?: string;

  // ===== AUDIT FIELDS =====
  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  cancelledAt?: Date;

  @Column({ nullable: true })
  cancellationReason?: string;

  // ===== INDEXES =====
  @Index()
  @Column({
    type: 'date',
    generatedType: 'STORED',
    asExpression: 'startTime::date',
  })
  appointmentDate: Date;

  // ===== HOOKS =====
  @BeforeInsert()
  setEndTime() {
    if (!this.endTime && this.startTime) {
      // Default 30-min duration for telehealth
      this.endTime = new Date(this.startTime.getTime() + 30 * 60000);
    }
  }
}
