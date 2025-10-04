import {
  IsString,
  IsOptional,
  IsArray,
  IsUUID,
  IsDateString,
  ArrayNotEmpty,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({
    description: 'Title of the event',
    example: 'React Training Workshop',
    required: true,
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Description of the event',
    example:
      'A comprehensive workshop on React fundamentals and best practices',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Array of training IDs that this event targets',
    example: [
      '550e8400-e29b-41d4-a716-446655440000',
      '550e8400-e29b-41d4-a716-446655440001',
    ],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  id_cible_training?: string[];

  @ApiProperty({
    description: 'ID of the training session that this event targets',
    example: '3f51f834-7a3f-41c7-83ad-2da85589f503',
    required: false,
  })
  @IsOptional()
  @IsUUID('4')
  id_cible_session?: string;

  @ApiProperty({
    description: 'ID of the course that this event targets',
    example: 'dc22d5a5-4ab5-4691-97b0-31228c94cb67',
    required: false,
  })
  @IsOptional()
  @IsUUID('4')
  id_cible_cours?: string;

  @ApiProperty({
    description: 'ID of the lesson that this event targets',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    required: false,
  })
  @IsOptional()
  @IsUUID('4')
  id_cible_lesson?: string;

  @ApiProperty({
    description: 'Array of user IDs that this event targets',
    example: ['user-uuid-1', 'user-uuid-2'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  id_cible_user?: string[];

  @ApiProperty({
    description: 'Beginning date of the event',
    example: '2025-02-01',
    required: true,
  })
  @IsDateString()
  begining_date: string;

  @ApiProperty({
    description: 'Beginning hour of the event (HH:MM format)',
    example: '09:00',
    required: true,
  })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'beginning_hour must be in HH:MM format (24-hour)',
  })
  beginning_hour: string;

  @ApiProperty({
    description: 'Ending hour of the event (HH:MM format)',
    example: '17:00',
    required: true,
  })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'ending_hour must be in HH:MM format (24-hour)',
  })
  ending_hour: string;

  @ApiProperty({
    description: 'ID of the user who created this event',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsOptional()
  @IsUUID('4')
  createdBy?: string;
}
