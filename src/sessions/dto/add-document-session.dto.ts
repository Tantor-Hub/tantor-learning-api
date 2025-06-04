import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class UploadDocumentDto {

  @IsNumber()
  @Type(() => Number) // transforme les strings en number (utile avec form-data)
  @IsNotEmpty()
  id_session: number;

  @IsString()
  @IsNotEmpty()
  key_document: string;

  @IsString()
  @IsOptional()
  description?: string;
}
