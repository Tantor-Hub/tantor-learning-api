import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Username or email address',
    default: 'john.doe@example.com',
  })
  @IsString()
  @IsNotEmpty()
  user_name: string;

  @ApiProperty({
    example: '123456',
    description: 'Verification code',
    default: '123456',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  verification_code: string;

  @ApiProperty({
    example: 'NewStrongPass123!',
    description: 'New password',
    default: 'NewStrongPass123!',
  })
  @IsString()
  @IsNotEmpty()
  new_password: string;

  @ApiProperty({
    example: 'NewStrongPass123!',
    description: 'Repeat new password',
    default: 'NewStrongPass123!',
  })
  @IsString()
  @IsOptional()
  repet_new_password: string;

  @ApiProperty({
    example: 'Password reset request',
    description: 'Optional description',
    default: 'Password reset request',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
