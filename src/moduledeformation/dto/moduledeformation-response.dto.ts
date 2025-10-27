import { ApiProperty } from '@nestjs/swagger';

export class ModuleDeFormationResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the training module',
    example: '550e8400-e29b-41d4-a716-446655440001',
    type: 'string',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Description of the training module',
    example: 'Introduction to Web Development with HTML, CSS, and JavaScript',
    type: 'string',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Link to the attached file (Google Drive URL)',
    example: 'https://drive.google.com/file/d/example/view',
    type: 'string',
  })
  piece_jointe: string;
}

export class ModuleDeFormationCreateResponseDto {
  @ApiProperty({
    description: 'Description of the training module',
    example: 'Introduction to Web Development with HTML, CSS, and JavaScript',
    type: 'string',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Link to the attached file (Google Drive URL)',
    example: 'https://drive.google.com/file/d/example/view',
    type: 'string',
  })
  piece_jointe: string;
}

export class ModuleDeFormationUpdateResponseDto {
  @ApiProperty({
    description: 'Description of the training module',
    example:
      'Updated Introduction to Web Development with HTML, CSS, and JavaScript',
    type: 'string',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Link to the attached file (Google Drive URL)',
    example: 'https://drive.google.com/file/d/updated-example/view',
    type: 'string',
  })
  piece_jointe: string;
}

export class ModuleDeFormationListResponseDto {
  @ApiProperty({
    description: 'Number of training modules returned',
    example: 3,
    type: 'number',
  })
  length: number;

  @ApiProperty({
    description: 'Array of training modules',
    type: [ModuleDeFormationResponseDto],
  })
  rows: ModuleDeFormationResponseDto[];
}

export class ApiResponseDto<T> {
  @ApiProperty({
    description: 'HTTP status code',
    example: 200,
    type: 'number',
  })
  status: number;

  @ApiProperty({
    description: 'Response message',
    example: 'Training modules retrieved successfully',
    type: 'string',
  })
  message?: string;

  @ApiProperty({
    description: 'Response data',
  })
  data: T;
}
