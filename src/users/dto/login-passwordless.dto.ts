import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginPasswordlessDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address',
    default: 'john.doe@example.com',
  })
  @IsEmail()
  email: string;
}
