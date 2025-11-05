import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSessionDocumentSecretaryDto {
  @ApiProperty({
    description: `Status of the session document.
    
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
  status?: 'pending' | 'rejected' | 'validated';

  @ApiProperty({
    description: `Comment or note from the secretary regarding the document (optional).
    
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

