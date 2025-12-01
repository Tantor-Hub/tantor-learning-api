import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

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

  @ApiProperty({
    example: false,
    description:
      'Whether the lesson document is published and visible to students',
    required: false,
    default: false,
  })
  @Transform(({ value }) => {
    // Handle undefined/null
    if (value === undefined || value === null) return false;
    
    // Handle boolean values
    if (typeof value === 'boolean') return value;
    
    // Handle string values
    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase().trim();
      if (lowerValue === 'true') return true;
      if (lowerValue === 'false') return false;
      // For any other string, default to false
      return false;
    }
    
    // For any other type, convert to boolean
    return Boolean(value);
  })
  @IsBoolean()
  @IsOptional()
  ispublish?: boolean;
}
