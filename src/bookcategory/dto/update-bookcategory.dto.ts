import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBookCategoryDto {
  @ApiProperty({
    description: 'Title of the book category',
    example: 'Programming',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;
}

