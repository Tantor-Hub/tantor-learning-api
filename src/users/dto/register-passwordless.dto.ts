import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterPasswordlessDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address',
    default: 'john.doe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'John',
    description: 'First name',
    default: 'John',
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Last name',
    default: 'Doe',
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'User avatar URL',
    default: 'https://example.com/avatar.jpg',
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({
    example: '123 Main St',
    description: 'Address',
    default: '123 Main St',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    example: 'France',
    description: 'Country',
    default: 'France',
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({
    example: 'Paris',
    description: 'City',
    default: 'Paris',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({
    example: 123456789,
    description: 'Identity number',
    default: 123456789,
  })
  @IsOptional()
  identityNumber?: number;

  @ApiProperty({
    example: '1990-01-01',
    description: 'Date of birth',
    default: '1990-01-01',
  })
  @IsOptional()
  @IsString()
  dateBirth?: string;
}
