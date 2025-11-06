import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDocumentInstanceSecretaryDto {
  @ApiProperty({
    description: `Status of the document instance.
    
**Allowed values:**
- 'pending': Document is pending review
- 'rejected': Document has been rejected
- 'validated': Document has been validated/approved

**Note:** Only secretaries can update the status.`,
    enum: ['pending', 'rejected', 'validated'],
    example: 'validated',
    required: false,
  })
  @IsOptional()
  @IsEnum(['pending', 'rejected', 'validated'])
  status?: 'pending' | 'validated' | 'rejected';

  @ApiProperty({
    description: `Comment or note from the secretary regarding the document instance (optional).
    
**Note:** This field is completely optional. Secretaries can:
- Add a comment when validating or rejecting a document
- Omit the comment field entirely if no comment is needed
- Update only the status without providing a comment`,
    example: 'Document verified successfully. All information is correct.',
    required: false,
  })
  @IsOptional()
  @IsString()
  comment?: string;
}

