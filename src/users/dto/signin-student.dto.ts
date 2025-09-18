import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignInStudentDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Username or email address',
    default: 'john.doe@example.com',
  })
  @IsString({ message: "Le nom d'utilisateur peut être l'adresse mail !" })
  @IsNotEmpty({ message: "Le nom d'utilisateur ne doit pas être vide !" })
  user_name: string;

  @ApiProperty({
    example: 'StrongPass123!',
    description: 'User password',
    default: 'StrongPass123!',
  })
  @IsString({ message: 'Entrer un mot de passe avant de continuer !' })
  @IsNotEmpty({ message: 'Le mot de passe ne doit pas etre vide !' })
  password: string;
}
