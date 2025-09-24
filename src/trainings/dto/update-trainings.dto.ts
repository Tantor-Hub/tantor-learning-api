import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsUUID,
  Min,
  MaxLength,
} from 'class-validator';
import { TrainingType } from '../../interface/interface.trainings';

export class UpdateTrainingsDto {
  @ApiProperty({
    description: 'Training ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Training title',
    example: 'Advanced React Development',
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiProperty({
    description: 'Training subtitle',
    example: 'Master React hooks and advanced patterns',
    required: false,
  })
  @IsOptional()
  @IsString()
  subtitle?: string;

  @ApiProperty({
    description: 'Training category ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  id_trainingcategory?: string;

  @ApiProperty({
    description: 'Training type - defines the delivery method of the training',
    enum: TrainingType,
    enumName: 'TrainingType',
    example: TrainingType.EN_LIGNE,
    required: false,
  })
  @IsOptional()
  @IsEnum(TrainingType)
  trainingtype?: TrainingType;

  @ApiProperty({
    description: 'RNC (Registration Number)',
    example: 'RNC123456',
    required: false,
  })
  @IsOptional()
  @IsString()
  rnc?: string;

  @ApiProperty({
    description: 'Training description',
    example: 'Comprehensive training on React development',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Training requirements',
    example: 'Basic knowledge of JavaScript',
    required: false,
  })
  @IsOptional()
  @IsString()
  requirement?: string;

  @ApiProperty({
    description: 'Pedagogy goals',
    example: 'Learn advanced React patterns and best practices',
    required: false,
  })
  @IsOptional()
  @IsString()
  pedagogygoals?: string;

  @ApiProperty({
    description: 'Training price',
    example: 299.99,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  prix?: number;
}
