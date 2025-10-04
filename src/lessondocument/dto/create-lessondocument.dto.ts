import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLessondocumentDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID of the lesson',
  })
  @IsString()
  @IsNotEmpty()
  id_lesson: string;

  @ApiProperty({
    example: 'PDF',
    description:
      'Type of the document (optional - will be auto-detected from file)',
    required: false,
  })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({
    example: 'Introduction to Programming Concepts',
    description: 'Title of the lesson document',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    example:
      'This document covers the fundamental concepts of programming including variables, loops, and functions.',
    description: 'Description of the lesson document content',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
