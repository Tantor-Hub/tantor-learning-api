import { IsEmail } from 'class-validator';

export class LoginPasswordlessDto {
  @IsEmail()
  email: string;
}
