import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsIn,
  IsNumberString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { DocumentKeyEnum } from 'src/utils/utiles.documentskeyenum';

export const DOCUMENT_KEYS = [...Object.keys(DocumentKeyEnum)];

export class UploadDocumentToSessionDto {
  @IsNumberString()
  id_session: number | string;

  @IsNumberString()
  @IsOptional()
  id_student?: number | string;

  @Transform(({ value }) => value?.toString())
  @IsString()
  @IsNotEmpty()
  @IsIn(DOCUMENT_KEYS, {
    message: ({ value }) =>
      `La clé "${value}" n'est pas valide. Elle doit être l'un des types de document suivants : ${DOCUMENT_KEYS.join(', ')}`,
  })
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
