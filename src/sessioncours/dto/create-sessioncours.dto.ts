import {
  IsString,
  IsUUID,
  IsOptional,
  IsBoolean,
  IsArray,
  IsInt,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSessionCoursDto {
  @ApiProperty({
    description: 'Title of the session course',
    example: 'Advanced React Development',
    required: true,
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Description of the session course',
    example: 'Learn advanced React concepts and best practices',
    required: true,
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'ID of the training session this course belongs to',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: true,
  })
  @IsUUID()
  id_session: string;

  @ApiProperty({
    description: 'Whether the session course is published',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_published?: boolean;

  @ApiProperty({
    description: 'Array of formateur IDs assigned to this session course',
    example: ['1', '2', '3'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  id_formateur?: string[];

  @ApiProperty({
    description: 'Ponderation value for the session course',
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsInt()
  ponderation?: number;
}
