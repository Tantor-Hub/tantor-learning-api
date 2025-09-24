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
  id_document: number; // for update purpose

  @IsString()
  @IsNotEmpty()
  document_name: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  piece_jointe: string;

  @IsString()
  @IsOptional()
  type?: string; // PDF, Word, etc.

  @IsString()
  @IsNotEmpty()
  id_lesson: string;

  @IsNumberString()
  @IsNotEmpty()
  id_session: number;
}
