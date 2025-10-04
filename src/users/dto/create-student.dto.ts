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
    example: 'uuid-string',
    description: 'User ID (UUID)',
    default: 'uuid-string',
  })
  @IsOptional()
  id?: string;

  @ApiProperty({ example: 'John', description: 'First name', default: 'John' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name', default: 'Doe' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

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
  address?: string;

  @ApiProperty({
    required: false,
    example: 'France',
    description: 'Country of residence',
    default: 'France',
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({
    required: false,
    example: 'Paris',
    description: 'City of residence',
    default: 'Paris',
  })
  @IsOptional()
  @IsString()
  city?: string;

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
  dateBirth?: string;

  @ApiProperty({
    required: false,
    example: 'student',
    description: 'User role',
    default: 'student',
  })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiProperty({
    required: false,
    example: 'uuid-string',
    description: 'UUID',
    default: 'uuid-string',
  })
  @IsOptional()
  @IsString()
  uuid?: string;

  @ApiProperty({
    required: false,
    example: 4,
    description: 'Role ID',
    default: 4,
  })
  @IsOptional()
  @IsNumber()
  id_role?: number;
}
