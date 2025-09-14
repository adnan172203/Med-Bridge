import { PartialType } from '@nestjs/mapped-types';
import { SignupDto } from 'src/identity/users/iam/authentication/dto/auth.dto';

export class UpdateUserDto extends PartialType(SignupDto) {}
