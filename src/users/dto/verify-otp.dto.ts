import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address',
    default: 'john.doe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'One-time password',
    default: '123456',
  })
  @IsNotEmpty()
  @IsString()
  otp: string;
}
