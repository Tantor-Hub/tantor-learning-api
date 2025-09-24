import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTrainingCategoryDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
