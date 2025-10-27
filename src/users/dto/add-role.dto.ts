import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class AddRoleDto {
  @IsString()
  @IsNotEmpty({ message: "L'email est obligatoire." })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Le rôle est obligatoire.' })
  @IsIn(['instructor', 'admin', 'student', 'secretary', 'expulled'], {
    message:
      "Le rôle doit être l'un des suivants: instructor, admin, student, secretary, expulled.",
  })
  role: string;
}
