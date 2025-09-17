import {
  IsString,
  IsOptional,
  ValidateNested,
  ArrayMinSize,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuestionSurveyDto } from './create-question.dto';

export class CreateSurveyDto {
  @IsNumber()
  id_session: number;

  @IsOptional()
  @IsString()
  description?: string;

  @ValidateNested({ each: true })
  @Type(() => CreateQuestionSurveyDto)
  @ArrayMinSize(1, {
    message: 'Un sondage doit contenir au moins une question.',
  })
  questions: CreateQuestionSurveyDto[];
}
