import { IsString, IsUUID, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSessionDocumentDto {
  @ApiProperty({
    description: 'Type of the session document',
    example: 'Identity Card',
    required: true,
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'ID of the student submitting the document',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: true,
  })
  @IsUUID()
  id_student: string;

  @ApiProperty({
    description: 'ID of the training session',
    example: '550e8400-e29b-41d4-a716-446655440001',
    required: true,
  })
  @IsUUID()
  id_session: string;

  @ApiProperty({
    description: 'Category of the document',
    enum: ['before', 'during', 'after'],
    example: 'before',
    required: true,
  })
  @IsEnum(['before', 'during', 'after'])
  categories: 'before' | 'during' | 'after';

  @ApiProperty({
    description: 'File attachment URL or path',
    example: 'https://example.com/documents/id-card.pdf',
    required: false,
  })
  @IsOptional()
  @IsString()
  piece_jointe?: string;

  @ApiProperty({
    description: 'Status of the document',
    enum: ['pending', 'rejected', 'validated'],
    example: 'pending',
    required: false,
    default: 'pending',
  })
  @IsOptional()
  @IsEnum(['pending', 'rejected', 'validated'])
  status?: 'pending' | 'rejected' | 'validated';
}
