import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateDocumentDto {
  @IsNotEmpty()
  @IsString()
  file_name: string;

  @IsNotEmpty()
  @IsString()
  url: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsNotEmpty()
  @IsNumber()
  id_lesson: number;

  @IsOptional()
  @IsNumber()
  createdBy?: number;

  @IsOptional()
  @IsNumber()
  id_session?: number;
}
