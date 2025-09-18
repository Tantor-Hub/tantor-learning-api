import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FindByEmailDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address to search for',
    default: 'john.doe@example.com',
  })
  @IsEmail()
  email: string;
}
