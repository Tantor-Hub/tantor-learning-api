import { IsNotEmpty, IsString } from 'class-validator';

export class SignInStudentDto {
  @IsString({ message: "Le nom d'utilisateur peut être l'adresse mail !" })
  @IsNotEmpty({ message: "Le nom d'utilisateur ne doit pas être vide !" })
  user_name: string;

  @IsString({ message: 'Entrer un mot de passe avant de continuer !' })
  @IsNotEmpty({ message: 'Le mot de passe ne doit pas etre vide !' })
  password: string;
}
