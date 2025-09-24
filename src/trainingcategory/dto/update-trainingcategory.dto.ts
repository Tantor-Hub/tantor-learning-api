import { IsString, IsOptional } from 'class-validator';

export class UpdateTrainingCategoryDto {
  @IsString()
  id: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
