import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsObject,
  IsEnum,
  IsUUID,
  IsArray,
} from 'class-validator';

export class UpdateTemplateDto {
  @ApiProperty({
    description: 'Title of the document template',
    example: 'Updated Employee Evaluation Form',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'TipTap JSON content of the template',
    example: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Updated Employee Evaluation' }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Please fill out the following updated evaluation form.',
            },
          ],
        },
      ],
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  content?: object;

  @ApiProperty({
    description: 'Type of document template',
    enum: ['before', 'during', 'after'],
    example: 'before',
    required: false,
  })
  @IsOptional()
  @IsEnum(['before', 'during', 'after'])
  type?: 'before' | 'during' | 'after';

  @ApiProperty({
    description:
      'Array of variable names that can be customized by users when filling the document. These variables appear as placeholders in the TipTap content.',
    example: ['nom', 'postnom'],
    required: false,
    type: 'array',
    items: { type: 'string' },
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  variables?: string[];

  @ApiProperty({
    description: 'URL of the image associated with the template',
    example:
      'https://res.cloudinary.com/your-cloud/documents/template-image.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
