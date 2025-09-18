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
  @ApiProperty({
    required: false,
    example: 1,
    description: 'User ID',
    default: 1,
  })
  @IsOptional()
  id?: number;

  @ApiProperty({
    required: false,
    example: 'uuid-string',
    description: 'User UUID',
    default: 'uuid-string',
  })
  @IsOptional()
  uuid?: string;

  @ApiProperty({ example: 'John', description: 'First name', default: 'John' })
  @IsNotEmpty()
  @IsString()
  fs_name: string;

  @ApiProperty({
    required: false,
    example: 1,
    description: 'Role ID',
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  id_role?: number;

  @ApiProperty({ example: 'Doe', description: 'Last name', default: 'Doe' })
  @IsNotEmpty()
  @IsString()
  ls_name: string;

  @ApiProperty({
    example: 'StrongPass123!',
    description: 'User password',
    default: 'StrongPass123!',
  })
  @IsNotEmpty()
  @IsStrongPassword()
  @MinLength(6)
  password: string;

  @ApiProperty({
    required: false,
    example: 'Johnny',
    description: 'Nickname',
    default: 'Johnny',
  })
  @IsOptional()
  @IsString()
  nick_name?: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address',
    default: 'john.doe@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    required: false,
    example: '+1234567890',
    description: 'Phone number',
    default: '+1234567890',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    required: false,
    example: '123456',
    description: 'Verification code',
    default: '123456',
  })
  @IsOptional()
  @IsString()
  verification_code?: string;

  @ApiProperty({
    required: false,
    example: '123 Main St',
    description: 'Physical address',
    default: '123 Main St',
  })
  @IsOptional()
  @IsString()
  adresse_physique?: string;

  @ApiProperty({
    required: false,
    example: 'France',
    description: 'Country of residence',
    default: 'France',
  })
  @IsOptional()
  @IsString()
  pays_residance?: string;

  @ApiProperty({
    required: false,
    example: 'Paris',
    description: 'City of residence',
    default: 'Paris',
  })
  @IsOptional()
  @IsString()
  ville_residance?: string;

  @ApiProperty({
    required: false,
    example: 'ID123456',
    description: 'Identity document number',
    default: 'ID123456',
  })
  @IsOptional()
  @IsString()
  num_piece_identite?: string;

  @ApiProperty({
    required: false,
    example: '1990-01-01',
    description: 'Date of birth',
    default: '1990-01-01',
  })
  @IsOptional()
  @IsString()
  date_of_birth: string;
}
