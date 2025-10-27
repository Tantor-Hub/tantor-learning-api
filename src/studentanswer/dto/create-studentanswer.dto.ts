import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateStudentAnswerDto {
  @ApiProperty({
    description: 'ID of the question being answered',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: true,
  })
  @IsUUID('4')
  questionId: string;

  @ApiProperty({
    description: 'ID of the student answering the question',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: true,
  })
  @IsUUID('4')
  studentId: string;

  @ApiProperty({
    description: 'ID of the evaluation this answer belongs to',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: true,
  })
  @IsUUID('4')
  evaluationId: string;

  @ApiProperty({
    description: 'Text answer (for text questions)',
    example: 'React is a JavaScript library for building user interfaces.',
    required: false,
  })
  @IsOptional()
  @IsString()
  answerText?: string;

  @ApiProperty({
    description:
      'Whether the answer is correct (calculated for multiple choice)',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isCorrect?: boolean;

  @ApiProperty({
    description:
      'Points awarded for this answer (can be null, updated by instructor)',
    example: 5,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Points must be a number' })
  @Min(0, { message: 'Points must be greater than or equal to 0' })
  points?: number;
}
