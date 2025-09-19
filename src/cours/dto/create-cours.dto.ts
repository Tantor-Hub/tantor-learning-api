import {
  IsInt,
  IsOptional,
  IsBoolean,
  IsNotEmpty,
  IsString,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCoursDto {
  @ApiProperty({
    example: 'Course Title',
    description: 'Title of the course',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Course Description',
    description: 'Description of the course',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 1,
    description: 'Session ID',
    default: 1,
  })
  @IsInt()
  @IsNotEmpty()
  id_session: number;

  @ApiProperty({
    example: [1, 2],
    description: 'Array of Formateur IDs',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  id_formateurs: number[];

  @ApiProperty({
    example: true,
    description: 'Whether the course is published',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_published?: boolean;
}
