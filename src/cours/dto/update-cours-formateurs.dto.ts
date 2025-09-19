import {
  IsArray,
  ArrayNotEmpty,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCoursFormateursDto {
  @ApiProperty({
    example: [1, 2, 3],
    description: 'Array of Formateur IDs to add to the course',
    required: false,
  })
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  id_formateurs?: number[];

  @ApiProperty({
    example: 'Updated Course Title',
    description: 'New title for the course',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    example: 'Updated course description',
    description: 'New description for the course',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
