import { IsString, IsUUID, IsOptional, IsEnum, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSessionDocumentDto {
  @ApiProperty({
    description: `Type of the session document (e.g., "Identity Card", "Passport", "Diploma").
    
**Important:** Each student can only have ONE document of each type per session. If you try to create a duplicate type, you will receive a 400 error.`,
    example: 'Identity Card',
    required: true,
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: `UUID of the training session. Must be a valid UUID format.
    
**Validation:** The session must exist in the database. If not found, you will receive a 400 error.`,
    example: '550e8400-e29b-41d4-a716-446655440001',
    required: true,
    format: 'uuid',
  })
  @IsUUID()
  id_session: string;

  @ApiProperty({
    description: `Category of the document indicating when it should be submitted.
    
**Allowed values:**
- 'before': Document required before the session starts
- 'during': Document required during the session
- 'after': Document required after the session ends

**Validation:** Must be exactly one of these three values (case-sensitive).`,
    enum: ['before', 'during', 'after'],
    example: 'before',
    required: true,
  })
  @IsEnum(['before', 'during', 'after'])
  categories: 'before' | 'during' | 'after';

  @ApiProperty({
    description: `Cloudinary URL for the attached file (automatically set after file upload).
    
**Note:** This field is automatically populated by the server after file upload. Do not send this field in the request.`,
    required: false,
  })
  @IsOptional()
  @IsString()
  piece_jointe?: string;
}
