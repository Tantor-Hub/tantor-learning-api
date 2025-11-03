import { IsEnum, IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CatalogueType } from 'src/interface/interface.catalogueformation';

export class CreateCatalogueFormationDto {
  @ApiProperty({
    description: 'Type of the catalogue formation (e.g., admin, instructor)',
  })
  @IsEnum(CatalogueType)
  @IsNotEmpty()
  type: CatalogueType;

  @ApiProperty({ description: 'Title of the catalogue formation' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Description of the catalogue formation',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description:
      'Piece jointe associated with the catalogue formation (Cloudinary URL)',
    required: false,
    example:
      'https://res.cloudinary.com/your-cloud/raw/upload/v1234567890/__tantorLearning/documents/document.pdf',
  })
  @IsString()
  @IsOptional()
  piece_jointe?: string;
}
