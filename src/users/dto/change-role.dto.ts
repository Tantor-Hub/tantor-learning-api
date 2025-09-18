import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class ChangeRoleDto {
  @IsString()
  @IsNotEmpty({ message: "L'email est obligatoire." })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Le rôle est obligatoire.' })
  @IsIn(['instructor', 'teacher', 'admin', 'student', 'secretary'], {
    message:
      "Le rôle doit être l'un des suivants: instructor, teacher, admin, student, secretary.",
  })
  role: string;
}
