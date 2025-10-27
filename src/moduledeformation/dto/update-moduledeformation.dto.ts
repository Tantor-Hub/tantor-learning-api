import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateModuleDeFormationDto {
  @ApiProperty({
    description: 'Updated description of the training module',
    example: 'Updated Introduction to Web Development with Advanced Topics',
    required: false,
    maxLength: 500,
    type: 'string',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description?: string;

  @ApiProperty({
    description: 'Updated attachment file (Google Drive URL)',
    example: 'https://drive.google.com/file/d/updated-example/view',
    required: false,
    type: 'string',
  })
  @IsOptional()
  @IsString()
  piece_jointe?: string;
}
