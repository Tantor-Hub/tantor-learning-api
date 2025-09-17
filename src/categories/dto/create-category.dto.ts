import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsNumber()
  @IsOptional()
  id_thematique: number;

  @IsString()
  category: string;

  @IsString()
  @IsOptional()
  description?: string;
}
