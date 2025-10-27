import { DocumentFieldType } from 'src/models/model.documentfield';
import { ApiProperty } from '@nestjs/swagger';

export class AddFieldDescriptor {
  @ApiProperty({ example: 'Full Name' })
  label: string;

  @ApiProperty({
    enum: DocumentFieldType,
    description:
      'Field type: text, textarea, date, number, signature, title, image',
  })
  type: DocumentFieldType;

  @ApiProperty({ example: 100 })
  x: number;

  @ApiProperty({ example: 50 })
  y: number;

  @ApiProperty({ example: 300 })
  width: number;

  @ApiProperty({ example: 30 })
  height: number;

  @ApiProperty({ required: false, example: 1 })
  orderIndex?: number;

  @ApiProperty({ required: false, example: false })
  required?: boolean;

  @ApiProperty({
    required: false,
    example: 'Enter your full name',
    description: 'Placeholder for text inputs',
  })
  placeholder?: string;

  // Style for title/text fields
  @ApiProperty({
    required: false,
    example: 20,
    description: 'Font size in px (for title/text)',
  })
  fontSize?: number;

  @ApiProperty({
    required: false,
    example: 'bold',
    description: 'Font weight (for title/text)',
  })
  fontWeight?: string;

  @ApiProperty({
    required: false,
    example: 'center',
    description: 'Text alignment (for title/text)',
  })
  textAlign?: string;

  // Image source for image or signature fields
  @ApiProperty({
    required: false,
    example: 'https://cdn.example.com/logo.png',
    description: 'URL of the image for image/signature fields',
  })
  imageUrl?: string;
}

export class AddFieldsDto {
  @ApiProperty({ type: [AddFieldDescriptor] })
  fields: AddFieldDescriptor[];
}
