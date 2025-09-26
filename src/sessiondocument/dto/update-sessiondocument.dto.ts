import { PartialType } from '@nestjs/swagger';
import { CreateSessionDocumentDto } from './create-sessiondocument.dto';
import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSessionDocumentDto extends PartialType(
  CreateSessionDocumentDto,
) {
  @ApiProperty({
    description: 'ID of the session document to update',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: true,
  })
  @IsUUID()
  id: string;
}
