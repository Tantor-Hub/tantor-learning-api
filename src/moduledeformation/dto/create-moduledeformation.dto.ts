import { IsOptional, IsString } from 'class-validator';

export class CreateModuleDeFormationDto {
  @IsOptional()
  @IsString()
  description?: string;
}
