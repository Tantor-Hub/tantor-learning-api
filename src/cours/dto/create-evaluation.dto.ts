import {
    IsString,
    IsOptional,
    IsBoolean,
    IsNumber,
    ValidateNested,
    IsArray,
    IsNotEmpty,
    ArrayMinSize,
    IsEnum,
    IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionType } from 'src/utils/utiles.typesprestation';

export class CreateOptionDto {
    @IsString()
    text: string;

    @IsBoolean()
    isCorrect: boolean;
}

export class CreateQuestionDto {
    @IsString()
    content: string;

    @IsEnum(QuestionType, { message: 'Le type doit être QCM, QCU ou TEXTE_LIBRE' })
    type: QuestionType;

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => CreateOptionDto)
    Options: CreateOptionDto[];
}

export class CreateEvaluationFullDto {
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsNumber()
    estimatedDuration: number;

    @IsNumber()
    @IsNotEmpty()
    score: number;

    @IsOptional()
    @IsBoolean()
    is_finished?: boolean;

    @IsNumber()
    id_cours: number;

    @IsNumber()
    id_session: number;

    @IsString()
    evaluation_type: string;

    @IsString()
    evaluation_condition: string;

    @IsBoolean()
    has_jury: boolean;

    @IsOptional()
    @IsString()
    location?: string;

    @IsDateString()
    datetime: string;

    @IsArray()
    @IsString({ each: true })
    allowed_materials: string[];

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => CreateQuestionDto)
    Questions: CreateQuestionDto[];
}
