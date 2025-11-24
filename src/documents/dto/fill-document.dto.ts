import { IsString, IsNotEmpty, IsObject, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FillDocumentDto {
  @ApiProperty({
    description: 'ID of the template to fill out',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
  })
  @IsString()
  @IsNotEmpty()
  templateId: string;

  @ApiProperty({
    description:
      'Deprecated: content is generated server-side from template + variableValues. If provided, it will be ignored.',
    required: false,
    type: Object,
  })
  @IsOptional()
  @IsObject()
  filledContent?: object;

  @ApiProperty({
    description: 'Values for the template variables defined by the secretary',
    example: { nom: 'John', postnom: 'Doe' },
    type: 'object',
    additionalProperties: true,
  })
  @IsObject()
  @IsOptional()
  variableValues?: object;

  @ApiProperty({
    description: 'Whether the document instance is published',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  is_published?: boolean;

  @ApiProperty({
    description: 'Whether the document instance has been signed',
    example: false,
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  signature?: boolean;
}
