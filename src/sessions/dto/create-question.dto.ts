import { IsString, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateOptionDto } from 'src/cours/dto/create-evaluation.dto';

export class CreateQuestionDto {
    @IsString()
    texte: string;

    @ValidateNested({ each: true })
    @Type(() => CreateOptionDto)
    @ArrayMinSize(2, { message: 'Chaque question doit avoir au moins deux options.' })
    options: CreateOptionDto[];
}