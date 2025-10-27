import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsEnum,
  IsInt,
  IsDateString,
  Min,
  IsArray,
  ArrayMinSize,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import {
  StudentevaluationType,
  MarkingStatus,
} from 'src/interface/interface.studentevaluation';

export class CreateStudentevaluationDto {
  @ApiProperty({
    description: 'Title of the student evaluation',
    example: 'React Fundamentals Assessment',
    required: true,
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Description of the student evaluation',
    example:
      'This evaluation tests students on React fundamentals including components, state, and props.',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Type of the evaluation',
    enum: StudentevaluationType,
    example: StudentevaluationType.EXERCISE,
    required: true,
  })
  @IsEnum(StudentevaluationType)
  type: StudentevaluationType;

  @ApiProperty({
    description: 'Total points for this evaluation',
    example: 100,
    required: true,
  })
  @IsInt()
  @Min(1)
  points: number;

  @ApiProperty({
    description: 'Array of student IDs who participated in this evaluation',
    example: [
      '550e8400-e29b-41d4-a716-446655440002',
      '550e8400-e29b-41d4-a716-446655440003',
    ],
    required: false,
    type: [String],
  })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value.map(String) : value))
  @IsArray()
  @IsString({ each: true })
  studentId?: string[];

  @ApiProperty({
    description: 'Submission deadline for this evaluation',
    example: '2025-12-31T23:59:59.000Z',
    required: true,
  })
  @IsDateString()
  submittiondate: string;

  @ApiProperty({
    description:
      'Beginning time for this evaluation in HH:MM format (optional)',
    example: '09:00',
    required: false,
  })
  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'beginningTime must be in HH:MM format (e.g., 09:00, 14:30)',
  })
  beginningTime?: string;

  @ApiProperty({
    description: 'Ending time for this evaluation in HH:MM format (optional)',
    example: '11:00',
    required: false,
  })
  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endingTime must be in HH:MM format (e.g., 09:00, 14:30)',
  })
  endingTime?: string;

  @ApiProperty({
    description: 'Whether this evaluation is published and visible to students',
    example: false,
    required: true,
  })
  @IsBoolean()
  ispublish: boolean;

  @ApiProperty({
    description: 'Whether results should be shown immediately after submission',
    example: false,
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isImmediateResult?: boolean;

  @ApiProperty({
    description: 'ID of the session course this evaluation is linked to',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: true,
  })
  @IsString()
  sessionCoursId: string;

  @ApiProperty({
    description: 'Array of lesson IDs this evaluation is linked to (optional)',
    example: [
      '550e8400-e29b-41d4-a716-446655440001',
      '550e8400-e29b-41d4-a716-446655440002',
    ],
    required: false,
    type: [String],
  })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value.map(String) : value))
  @IsArray()
  @IsString({ each: true })
  lessonId?: string[];

  @ApiProperty({
    description: 'Status of the marking process',
    enum: MarkingStatus,
    example: MarkingStatus.PENDING,
    required: false,
    default: MarkingStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(MarkingStatus)
  markingStatus?: MarkingStatus;
}
