import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsArray,
  IsDateString,
  IsUUID,
  IsOptional,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateTrainingSessionDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Training ID that this session belongs to',
  })
  @IsUUID()
  id_trainings: string;

  @ApiProperty({
    example: 'Advanced React Development Session',
    description: 'Title of the training session',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    example: 30,
    description: 'Total number of places available',
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  nb_places: number;

  @ApiProperty({
    example: 25,
    description: 'Number of available places',
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  available_places: number;

  @ApiProperty({
    example: ['CV', 'Diploma', 'ID Card'],
    description: 'List of required documents before training',
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  required_document_before?: string[];

  @ApiProperty({
    example: ['Attendance Sheet', 'Progress Report'],
    description: 'List of required documents during training',
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  required_document_during?: string[];

  @ApiProperty({
    example: ['Certificate Request', 'Feedback Form', 'Final Report'],
    description: 'List of required documents after training',
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  required_document_after?: string[];

  @ApiProperty({
    example: ['Credit Card', 'Bank Transfer', 'OPCO'],
    description: 'List of accepted payment methods',
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  payment_method?: string[];

  @ApiProperty({
    example: ['Experience Level', 'Learning Goals', 'Availability'],
    description: 'List of survey questions',
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  survey?: string[];

  @ApiProperty({
    example: 'This training session follows our standard regulations...',
    description: 'Regulation text for the training session',
  })
  @IsString()
  regulation_text: string;

  @ApiProperty({
    example: '2024-03-15T09:00:00.000Z',
    description: 'Beginning date and time of the training session',
  })
  @IsDateString()
  begining_date: string;

  @ApiProperty({
    example: '2024-03-20T17:00:00.000Z',
    description: 'Ending date and time of the training session',
  })
  @IsDateString()
  ending_date: string;

  @ApiProperty({
    example: 'https://cpf.example.com/session/123',
    description: 'CPF link for the training session',
    required: false,
  })
  @IsOptional()
  @IsString()
  cpf_link?: string;
}
