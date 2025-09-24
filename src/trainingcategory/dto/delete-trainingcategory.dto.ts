import { IsString } from 'class-validator';

export class DeleteTrainingCategoryDto {
  @IsString()
  id: string;
}
