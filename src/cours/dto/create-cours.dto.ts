import {
  IsInt,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCoursDto {
  @ApiProperty({
    example: 1,
    description: 'Preset course ID',
    default: 1,
  })
  @IsInt()
  @IsNotEmpty()
  id_preset_cours: number;

  @ApiProperty({
    example: 1,
    description: 'Session ID',
    default: 1,
  })
  @IsInt()
  @IsNotEmpty()
  id_session: number;

  @ApiProperty({
    example: 1,
    description: 'Category ID',
    default: 1,
  })
  @IsInt()
  @IsOptional()
  id_category?: number;

  @ApiProperty({
    example: 1,
    description: 'Thematic ID',
    default: 1,
  })
  @IsInt()
  @IsNotEmpty()
  @IsOptional()
  id_thematic?: number;

  @ApiProperty({
    example: 1,
    description: 'Formateur ID',
    default: 1,
  })
  @IsOptional()
  @IsInt()
  id_formateur?: number;

  @ApiProperty({
    example: 8,
    description: 'Course duration in hours',
    default: 8,
  })
  @IsOptional()
  @IsNumber()
  duree?: number;

  @ApiProperty({
    example: 1.5,
    description: 'Course weighting',
    default: 1.5,
  })
  @IsOptional()
  @IsNumber()
  ponderation?: number;

  @ApiProperty({
    example: true,
    description: 'Whether the course is published',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_published?: boolean;

  @ApiProperty({
    example: 1,
    description: 'User ID who created the course',
    default: 1,
  })
  @IsOptional()
  @IsInt()
  createdBy?: number;
}
