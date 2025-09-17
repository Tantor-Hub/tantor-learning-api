import { IsEmail, IsString } from 'class-validator';

export class ResentCodeDto {
  @IsString()
  user_email: string;
}
