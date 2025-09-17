import { User } from 'src/identity/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Medical Context

  @Column({ nullable: true })
  medicareNumber: string;

  @Column({ type: 'text', nullable: true })
  bloodType: string; // e.g., "O+"

  @Column({ type: 'jsonb', default: [] })
  allergies: string[]; // e.g., ["Penicillin", "Peanuts"]

  @Column({ type: 'jsonb', default: [] })
  currentMedications: {
    name: string;
    dosage: string;
  }[];

  // Emergency Contact
  @Column({ type: 'jsonb', nullable: true })
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };

  // Telehealth Specific
  @Column({ default: false })
  hasConsentedToTelehealth: boolean;

  @Column({ type: 'timestamp', nullable: true })
  consentSignedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.patientProfile, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @BeforeInsert()
  setConsentTimestamp() {
    if (this.hasConsentedToTelehealth && !this.consentSignedAt) {
      this.consentSignedAt = new Date();
    }
  }
}
