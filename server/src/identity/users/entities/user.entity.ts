import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { Role } from '../enums/role.enum';
import { Gender } from '../enums/gender.enum';
import { Patient } from 'src/identity/patients/entities/patient.entity';

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
  dateOfBirth: Date;

  @Column({
    type: 'enum',
    enum: Gender,
    default: Gender.UNSPECIFIED,
  })
  gender: Gender;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.PATIENT,
  })
  role: Role;

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

  // security
  @Column()
  password: string;

  // Relations
  // @OneToOne(() => Doctor, (doctor) => doctor.user)
  // doctorProfile: Doctor;

  @OneToOne(() => Patient, (patient) => patient.user)
  patientProfile: Patient;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
