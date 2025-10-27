import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateModuleDeFormationDto {
  @ApiProperty({
    description: 'Description of the training module',
    example: 'Introduction to Web Development with HTML, CSS, and JavaScript',
    required: false,
    maxLength: 500,
    type: 'string',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description?: string;
}
