import {
  IsString,
  IsNotEmpty,
  IsObject,
  IsEnum,
  IsUUID,
  IsArray,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTemplateDto {
  @ApiProperty({
    description: 'Title of the document template',
    example: 'Employee Evaluation Form',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'TipTap JSON content of the template',
    example: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Pre-Training Assessment Form' }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Please fill out this form before attending the training session.',
            },
          ],
        },
      ],
    },
    type: 'object',
    additionalProperties: true,
  })
  @IsObject()
  content: object;

  @ApiProperty({
    description: 'ID of the training session this template belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({
    description: 'Type of document template',
    example: 'before',
    enum: ['before', 'during', 'after'],
    type: 'string',
  })
  @IsEnum(['before', 'during', 'after'])
  @IsNotEmpty()
  type: 'before' | 'during' | 'after';

  @ApiProperty({
    description:
      'Array of variable names that can be customized by users when filling the document. These variables appear as placeholders in the TipTap content.',
    example: [],
    type: 'array',
    items: { type: 'string' },
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  variables?: string[];

  @ApiProperty({
    description: 'Cloudinary URL of the image associated with the template',
    example:
      'https://res.cloudinary.com/example/image/upload/v1234567890/template-image.jpg',
    type: 'string',
    required: false,
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({
    description: 'Whether the document template requires a signature',
    example: false,
    type: 'boolean',
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  signature?: boolean;
}
