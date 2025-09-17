import { Transform } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsEnum,
  IsOptional,
  IsDateString,
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
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string; // Defaults to 'Australia'
  };

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
