import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDocumentDto {
  @ApiProperty({
    example: 'Job Application Form',
    description:
      'Human-friendly document title. Displayed to users and used in listings/search.',
  })
  title: string;

  @ApiPropertyOptional({
    example: 'Form for job applicants to fill in their details',
    description:
      'Optional description to explain the purpose or usage of the document.',
  })
  description?: string;

  @ApiProperty({
    description:
      'Document body. Accepts either: (1) an HTML string, or (2) a JSON layout object your frontend understands. For simple structured forms, pass an empty object {} and define fields with POST /documents/:id/fields.',
    oneOf: [
      { type: 'string', example: '<div><h1>My Form</h1></div>' },
      {
        type: 'object',
        example: {
          version: 1,
          sections: [
            { id: 'section-1', title: 'Applicant', rows: [] },
            { id: 'section-2', title: 'Details', rows: [] },
          ],
        },
      },
    ],
  })
  content: any;

  @ApiProperty({
    description:
      'Creator user ID (Users.id). Must be a valid UUID referencing an existing user.',
    example: 'user-uuid',
  })
  createdBy: string;
}
