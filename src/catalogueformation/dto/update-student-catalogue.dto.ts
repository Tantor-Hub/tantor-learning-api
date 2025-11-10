import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStudentCatalogueDto {
  @ApiProperty({
    description: 'Title of the student catalogue formation',
    example: 'Student Training Catalogue',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'Description of the catalogue formation',
    required: false,
    example: 'Comprehensive training program for students',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'ID of the training associated with this catalogue',
    example: '550e8400-e29b-41d4-a716-446655440001',
    format: 'uuid',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  id_training?: string;

  @ApiProperty({
    description:
      'Piece jointe associated with the catalogue formation (Cloudinary URL)',
    required: false,
    example:
      'https://res.cloudinary.com/your-cloud/raw/upload/v1234567890/__tantorLearning/documents/document.pdf',
  })
  @IsString()
  @IsOptional()
  piece_jointe?: string;
}

