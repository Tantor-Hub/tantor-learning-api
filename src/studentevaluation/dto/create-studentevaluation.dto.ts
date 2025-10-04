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
} from 'class-validator';
import { StudentevaluationType } from 'src/interface/interface.studentevaluation';

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
    required: false,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  points?: number;

  @ApiProperty({
    description: 'ID of the lecturer who created this evaluation',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: true,
  })
  @IsUUID('4')
  lecturerId: string;

  @ApiProperty({
    description: 'Submission deadline for this evaluation',
    example: '2025-12-31T23:59:59.000Z',
    required: true,
  })
  @IsDateString()
  submittiondate: string;

  @ApiProperty({
    description: 'Whether this evaluation is published and visible to students',
    example: false,
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  ispublish?: boolean;

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
    description:
      'ID of the session course this evaluation is linked to (optional)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsOptional()
  @IsUUID('4')
  sessionCoursId?: string;

  @ApiProperty({
    description: 'ID of the lesson this evaluation is linked to (optional)',
    example: '550e8400-e29b-41d4-a716-446655440001',
    required: false,
  })
  @IsOptional()
  @IsUUID('4')
  lessonId?: string;
}
