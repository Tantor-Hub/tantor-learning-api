import { IsString, IsOptional, IsNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class AttributeRoleDto {
  @Type(() => Number)
  @IsNumber({}, { message: "L'id du rôle doit être un nombre." })
  @IsNotEmpty({ message: "L'id du rôle est obligatoire." })
  id_role: number;

  @Type(() => Number)
  @IsNumber({}, { message: "L'id de l'utilisateur doit être un nombre." })
  @IsNotEmpty({ message: "L'id de l'utilisateur est obligatoire." })
  id_user: number;

  @IsString({ message: 'La description doit être une chaîne de caractères.' })
  @IsOptional()
  description?: string;
}
