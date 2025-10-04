import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsEnum,
  IsInt,
  Min,
} from 'class-validator';
import { QuestionType } from 'src/interface/interface.evaluationquestion';

export class CreateEvaluationQuestionDto {
  @ApiProperty({
    description: 'ID of the evaluation this question belongs to',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: true,
  })
  @IsUUID('4')
  evaluationId: string;

  @ApiProperty({
    description: 'Type of the question',
    enum: QuestionType,
    example: QuestionType.MULTIPLE_CHOICE,
    required: true,
  })
  @IsEnum(QuestionType)
  type: QuestionType;

  @ApiProperty({
    description: 'The question text',
    example: 'What is the correct way to create a React component?',
    required: false,
  })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiProperty({
    description:
      'Whether results should be shown immediately for this question',
    example: false,
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isImmediateResult?: boolean;

  @ApiProperty({
    description: 'Points awarded for correct answer',
    example: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  points?: number;
}
