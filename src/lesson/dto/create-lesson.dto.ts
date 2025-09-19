import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLessonDto {
  @ApiProperty({
    description: 'The title of the lesson',
    example: 'Introduction to Programming',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'The description of the lesson',
    example: 'Basic concepts of programming',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'The ID of the course this lesson belongs to',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  id_cours: number;
}
