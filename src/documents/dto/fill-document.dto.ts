import { IsString, IsNotEmpty, IsObject, IsOptional } from 'class-validator';
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
    description: 'User-filled TipTap JSON content',
    example: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'My Evaluation' }],
        },
      ],
    },
    type: 'object',
    additionalProperties: true,
  })
  @IsObject()
  filledContent: object;

  @ApiProperty({
    description: 'Values for the template variables defined by the secretary',
    example: { nom: 'John', postnom: 'Doe' },
    type: 'object',
    additionalProperties: true,
  })
  @IsObject()
  @IsOptional()
  variableValues?: object;
}
