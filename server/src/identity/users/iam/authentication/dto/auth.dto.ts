import { Transform } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsEnum,
  IsOptional,
  IsDateString,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { Gender } from 'src/identity/users/enums/gender.enum';

import { Role } from 'src/identity/users/enums/role.enum';

export class SignupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDateString()
  @Transform(({ value }) => new Date(value))
  dateOfBirth: Date;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };

  @IsOptional()
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string; // Defaults to 'Australia'
  };

  @IsOptional()
  @IsString()
  bloodType?: string;

  @IsOptional()
  @IsArray()
  allergies?: string[];

  @IsOptional()
  currentMedications?: Array<{
    name: string;
    dosage: string;
  }>;

  @IsBoolean()
  hasConsentedToTelehealth: boolean;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @IsString()
  @IsOptional()
  phone?: string;
}

export class SigninDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
