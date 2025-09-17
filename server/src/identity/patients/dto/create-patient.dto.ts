import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

class UserRefDto {
  @IsUUID()
  id: string;
}
export class CreatePatientDto {
  @IsOptional()
  medicareNumber?: string;

  @IsOptional()
  privateInsuranceProvider?: string;

  @IsOptional()
  emergencyContactName?: string;

  @IsOptional()
  emergencyContactPhone?: string;

  @IsOptional()
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
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

  @ValidateNested()
  @Type(() => UserRefDto)
  user: UserRefDto;
}
