import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  IsUUID,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookDto {
  @ApiProperty({
    description: 'Title of the book',
    example: 'Introduction to Programming',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Description of the book',
    example: 'A comprehensive guide to programming fundamentals',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Array of session UUIDs associated with this book',
    example: [
      '550e8400-e29b-41d4-a716-446655440000',
      '550e8400-e29b-41d4-a716-446655440001',
    ],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  session?: string[];

  @ApiProperty({
    description: 'Author of the book',
    example: 'John Doe',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  author: string;

  @ApiProperty({
    description: 'Array of BookCategory UUIDs associated with this book',
    example: [
      '550e8400-e29b-41d4-a716-446655440000',
      '550e8400-e29b-41d4-a716-446655440001',
    ],
    type: [String],
    required: true,
  })
  @IsNotEmpty()
  @IsArray()
  @IsUUID('4', { each: true })
  category: string[];

  // Note: icon and piece_joint are now uploaded as files, not strings
  // They will be handled in the controller via file uploads

  @ApiProperty({
    description: 'Whether the book is public',
    example: false,
    type: Boolean,
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  public?: boolean;

  @ApiProperty({
    description: 'Whether the book is downloadable',
    example: false,
    type: Boolean,
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  downloadable?: boolean;
}

