import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LegalDocumentType } from 'src/models/model.legaldocument';

export class CreateLegalDocumentDto {
  @ApiProperty({
    enum: LegalDocumentType,
    description: 'Type of legal document',
    example: LegalDocumentType.CODE_ETHIQUE,
  })
  @IsEnum(LegalDocumentType)
  @IsNotEmpty()
  type: LegalDocumentType;

  @ApiProperty({
    description: 'Content of the legal document',
    example: 'This is the content of the legal document...',
    required: false,
  })
  @IsOptional()
  @IsString()
  content?: string;
}
