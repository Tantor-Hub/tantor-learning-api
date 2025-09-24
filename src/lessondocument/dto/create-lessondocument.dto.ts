import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLessondocumentDto {
  @ApiProperty({
    example: 'document.pdf',
    description: 'Name of the file',
  })
  @IsString()
  @IsNotEmpty()
  file_name: string;

  @ApiProperty({
    example: 'https://example.com/document.pdf',
    description: 'URL of the document',
  })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({
    example: 'PDF',
    description: 'Type of the document',
    required: false,
  })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID of the lesson',
  })
  @IsString()
  @IsNotEmpty()
  id_lesson: string;

  @ApiProperty({
    example: 1,
    description: 'ID of the user who created it',
    required: false,
  })
  @IsInt()
  @IsOptional()
  createdBy?: number;

  @ApiProperty({
    example: 1,
    description: 'ID of the session',
  })
  @IsInt()
  @IsNotEmpty()
  id_session: number;
}
