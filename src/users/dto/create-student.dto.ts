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
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ required: false, example: 1, description: 'User ID' })
  @IsOptional()
  id?: number;

  @ApiProperty({
    required: false,
    example: 'uuid-string',
    description: 'User UUID',
  })
  @IsOptional()
  uuid?: string;

  @ApiProperty({ example: 'John', description: 'First name' })
  @IsNotEmpty()
  @IsString()
  fs_name: string;

  @ApiProperty({ required: false, example: 1, description: 'Role ID' })
  @IsOptional()
  @IsNumber()
  id_role?: number;

  @ApiProperty({ example: 'Doe', description: 'Last name' })
  @IsNotEmpty()
  @IsString()
  ls_name: string;

  @ApiProperty({ example: 'StrongPass123!', description: 'User password' })
  @IsNotEmpty()
  @IsStrongPassword()
  @MinLength(6)
  password: string;

  @ApiProperty({ required: false, example: 'Johnny', description: 'Nickname' })
  @IsOptional()
  @IsString()
  nick_name?: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    required: false,
    example: '+1234567890',
    description: 'Phone number',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    required: false,
    example: '123456',
    description: 'Verification code',
  })
  @IsOptional()
  @IsString()
  verification_code?: string;

  @ApiProperty({
    required: false,
    example: '123 Main St',
    description: 'Physical address',
  })
  @IsOptional()
  @IsString()
  adresse_physique?: string;

  @ApiProperty({
    required: false,
    example: 'France',
    description: 'Country of residence',
  })
  @IsOptional()
  @IsString()
  pays_residance?: string;

  @ApiProperty({
    required: false,
    example: 'Paris',
    description: 'City of residence',
  })
  @IsOptional()
  @IsString()
  ville_residance?: string;

  @ApiProperty({
    required: false,
    example: 'ID123456',
    description: 'Identity document number',
  })
  @IsOptional()
  @IsString()
  num_piece_identite?: string;

  @ApiProperty({
    required: false,
    example: '1990-01-01',
    description: 'Date of birth',
  })
  @IsOptional()
  @IsString()
  date_of_birth: string;
}
