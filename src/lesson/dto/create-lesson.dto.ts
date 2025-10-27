import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLessonDto {
  @ApiProperty({
    description: 'The title of the lesson',
    example: 'Introduction to Programming',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'The description of the lesson',
    example: 'Basic concepts of programming',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'The UUID of the course this lesson belongs to',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsUUID()
  id_cours: string;

  @ApiProperty({
    example: false,
    description: 'Whether the lesson is published and visible to students',
    required: true,
  })
  @IsBoolean()
  ispublish: boolean;

  @ApiProperty({
    description: 'The duration of the lesson',
    example: '60h',
    required: false,
  })
  @IsOptional()
  @IsString()
  duree?: string;
}
