import {
    IsString,
    IsNotEmpty,
    IsInt,
    IsOptional,
    IsNumberString,
} from 'class-validator';

export class CreateDocumentDto {

    @IsString()
    @IsOptional()
    @IsNumberString()
    id_document: number;

    @IsString()
    @IsNotEmpty()
    file_name: string;

    @IsString()
    @IsNotEmpty()
    url: string;

    @IsString()
    @IsOptional()
    type?: string; // PDF, Word, etc.

    @IsInt()
    @IsNotEmpty()
    id_cours: number;
}
