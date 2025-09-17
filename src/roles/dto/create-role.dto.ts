import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  role: string;

  @IsString()
  @IsOptional()
  description?: string;
}
