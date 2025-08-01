import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  BeforeInsert,
} from 'typeorm';
import { Role } from '../enums/role.enum';
import { Gender } from '../enums/gender.enum';

// export enum UserRole {
//   ADMIN = 'admin',
//   USER = 'user',
// }
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Identity Details

  @Column()
  name: string;

  @Column({ type: 'date' })
  dateOfBirth: Date; // Better than 'age' for accuracy

  @Column({
    type: 'enum',
    enum: Gender,
    default: Gender.UNSPECIFIED,
  })
  gender: Gender;

  // Contact Information

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: false })
  phone: string;

  @Column({ type: 'jsonb', nullable: true })
  address: {
    street: string;
    city: string;
    state: string; // e.g., "WA"
    postalCode: string;
    country: string; // Default: "Australia"
  };

  // Medical Context
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

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.PATIENT,
  })
  role: Role;

  @Column()
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  setConsentTimestamp() {
    if (this.hasConsentedToTelehealth && !this.consentSignedAt) {
      this.consentSignedAt = new Date();
    }
  }
}
