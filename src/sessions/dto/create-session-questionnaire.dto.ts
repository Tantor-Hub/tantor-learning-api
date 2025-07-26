import { IsString, IsOptional, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuestionDto } from './create-question.dto';

export class CreateSurveyDto {
    @IsString()
    titre: string;

    @IsOptional()
    @IsString()
    description?: string;

    @ValidateNested({ each: true })
    @Type(() => CreateQuestionDto)
    @ArrayMinSize(1, { message: 'Un sondage doit contenir au moins une question.' })
    questions: CreateQuestionDto[];
}