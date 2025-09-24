import { IsString, IsNotEmpty, IsOptional, IsInt, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSessiondocumentDto {
  @ApiProperty({
    example: 'Session Document Title',
    description: 'Title of the session document',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Description of the session document',
    description: 'Description of the session document',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 'https://example.com/document.pdf',
    description: 'Piece jointe (attachment) URL or file path',
  })
  @IsString()
  @IsNotEmpty()
  piece_jointe: string;

  @ApiProperty({
    example: 'PDF',
    description: 'Type of the document',
    required: false,
  })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({
    example: 'pendant',
    description: 'Category of the document',
    enum: ['pendant', 'durant', 'apres'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['pendant', 'durant', 'apres'])
  category: string;

  @ApiProperty({
    example: 1,
    description: 'ID of the session',
  })
  @IsInt()
  @IsNotEmpty()
  id_session: number;

  @ApiProperty({
    example: 1,
    description: 'ID of the user who created it',
    required: false,
  })
  @IsInt()
  @IsOptional()
  createdBy?: number;
}
