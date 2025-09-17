import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
} from 'class-validator';

export class CreatePresetCoursDto {
  @IsOptional()
  @IsNumber()
  id_cours: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description: string;
}
