import { IsInt, IsArray, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ChapitreDto {
    @IsString()
    chapitre: string;

    @IsArray()
    @IsString({ each: true })
    paragraphes: string[];
}

export class CreateCoursContentDto {
    @IsInt()
    id_cours: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ChapitreDto)
    content: ChapitreDto[];
}