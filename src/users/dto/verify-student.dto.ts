import {
  IsEmail,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class VerifyAsStudentDto {
  @IsEmail()
  email_user: string;

  @IsNumber()
  // @MinLength(6, { message: "La taille du code de verification doit etre 6 chiffres" })
  // @MaxLength(6, { message: "La taille du code de verification doit etre 6 chiffres" })
  verication_code: number;
}
