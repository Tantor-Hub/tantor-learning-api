import {
    IsInt,
    IsOptional,
    IsBoolean,
    IsNumber,
    IsNotEmpty,
  } from 'class-validator';
  
  export class CreateCoursDto {
    @IsInt()
    @IsNotEmpty()
    id_preset_cours: number;
  
    @IsInt()
    @IsNotEmpty()
    id_session: number;
  
    @IsInt()
    @IsOptional()
    id_category?: number;
  
    @IsInt()
    @IsNotEmpty()
    @IsOptional()
    id_thematic?: number;
  
    @IsOptional()
    @IsInt()
    id_formateur?: number;
  
    @IsOptional()
    @IsNumber()
    duree?: number;
  
    @IsOptional()
    @IsNumber()
    ponderation?: number;
  
    @IsOptional()
    @IsBoolean()
    is_published?: boolean;
  
    @IsOptional()
    @IsInt()
    createdBy?: number;
  }
  