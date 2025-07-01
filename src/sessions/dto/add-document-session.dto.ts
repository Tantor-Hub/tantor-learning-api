import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DocumentKeyEnum } from 'src/utils/utiles.documentskeyenum';

export const DOCUMENT_KEYS = [
  ...Object.keys(DocumentKeyEnum)
];

export class UploadDocumentToSessionDto {
  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  id_session: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  id_student: number;

  @IsString()
  @IsIn(DOCUMENT_KEYS, { message: 'key_document must be one of the predefined document types' })
  key_document: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  document: string;

  @IsString()
  @IsOptional()
  piece_jointe?: string;
}
