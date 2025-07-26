import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsBoolean, IsEnum, IsString, ValidateNested } from "class-validator";
import { QuestionType } from "src/utils/utiles.typesprestation";

export class CreateOptionDto {
    @IsString()
    text: string;

    @IsBoolean()
    isCorrect: boolean;
}

export class CreateQuestionSurveyDto {
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