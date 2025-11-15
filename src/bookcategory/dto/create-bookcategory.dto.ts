import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookCategoryDto {
  @ApiProperty({
    description: 'Title of the book category',
    example: 'Programming',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  title: string;
}

