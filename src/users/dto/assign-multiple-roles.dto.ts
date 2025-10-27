import { IsString, IsNotEmpty, IsArray, ArrayMinSize, IsIn } from 'class-validator';

export class AssignMultipleRolesDto {
  @IsString()
  @IsNotEmpty({ message: "L'email est obligatoire." })
  email: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'Au moins un rôle doit être fourni.' })
  @IsIn(['instructor', 'admin', 'student', 'secretary', 'expulled'], {
    each: true,
    message: "Chaque rôle doit être l'un des suivants: instructor, admin, student, secretary, expulled.",
  })
  roles: string[];
}
