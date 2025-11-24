import {
  IsOptional,
  IsString,
  IsArray,
  IsUUID,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBookDto {
  @ApiProperty({
    description: 'Title of the book',
    example: 'Introduction to Programming',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

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
    required: false,
  })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiProperty({
    description: 'Array of BookCategory UUIDs associated with this book',
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
  category?: string[];

  @ApiProperty({
    description: 'Icon URL from Cloudinary',
    example: 'https://res.cloudinary.com/example/image/upload/v1234567890/icon.jpg',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({
    description: 'Attachment URL from Cloudinary',
    example: 'https://res.cloudinary.com/example/image/upload/v1234567890/document.pdf',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  piece_joint?: string;

  @ApiProperty({
    description: 'Whether the book is public',
    example: false,
    type: Boolean,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  public?: boolean;

  @ApiProperty({
    description: 'Whether the book is downloadable',
    example: false,
    type: Boolean,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  downloadable?: boolean;
}

