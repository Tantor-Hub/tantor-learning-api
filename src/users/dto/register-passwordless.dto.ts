import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegisterPasswordlessDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  identityNumber?: number;

  @IsOptional()
  @IsString()
  dateBirth?: string;
}
