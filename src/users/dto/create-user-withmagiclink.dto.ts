import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';

export class CreateUserMagicLinkDto {
  @IsNumber()
  id_role: number;

  @IsEmail()
  email: string;
}
