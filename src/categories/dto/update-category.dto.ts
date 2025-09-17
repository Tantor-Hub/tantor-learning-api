import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateCategoryDto {
  @IsNumber()
  @IsOptional()
  id_thematique?: number;

  @IsString()
  @IsOptional()
  category: string;

  @IsString()
  @IsOptional()
  description?: string;
}
