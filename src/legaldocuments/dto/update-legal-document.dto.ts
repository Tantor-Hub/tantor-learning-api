import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateLegalDocumentDto {
  @ApiProperty({
    description: 'Content of the legal document',
    example: 'This is the updated content of the legal document...',
    required: false,
  })
  @IsOptional()
  @IsString()
  content?: string;
}
