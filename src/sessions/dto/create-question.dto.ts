import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { QuestionType } from "src/utils/utiles.typesprestation";

export class CreateOptionDto {
    @IsString()
    text: string;

    @IsBoolean()
    @IsOptional()
    is_correct: boolean;

    @IsOptional()
    @IsNumber()
    id_question: number; // ID de la question à laquelle cette option appartient
}

export class CreateQuestionSurveyDto {
    @IsString()
    titre: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsBoolean()
    is_required: boolean;

    @IsEnum(QuestionType, { message: 'Le type doit être QCM, QCU ou TEXTE_LIBRE' })
    type_question: QuestionType;

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => CreateOptionDto)
    options: CreateOptionDto[] = [];
}