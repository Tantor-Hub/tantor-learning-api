import { IsString } from 'class-validator';

export class CreateNewsLetterDto {
  @IsString()
  user_email: string;
}
