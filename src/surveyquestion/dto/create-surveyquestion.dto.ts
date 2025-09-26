import {
  IsString,
  IsUUID,
  IsArray,
  IsEnum,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { SurveyCategories } from 'src/enums/survey-categories.enum';
import { SurveyQuestionData } from 'src/interface/interface.question';

export class CreateSurveyQuestionDto {
  @ApiProperty({
    description: 'Title of the survey',
    example: 'Pre-Training Assessment Survey',
    required: true,
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'ID of the training session this survey belongs to',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: true,
  })
  @IsUUID()
  id_session: string;

  @ApiProperty({
    description: 'Array of survey questions with their options',
    example: [
      {
        id: 'q1',
        type: 'multiple_choice',
        question: 'What is your current experience level with React?',
        options: [
          { id: 'opt1', text: 'Beginner' },
          { id: 'opt2', text: 'Intermediate' },
          { id: 'opt3', text: 'Advanced' },
        ],
        required: true,
        order: 1,
        maxSelections: 1,
      },
      {
        id: 'q2',
        type: 'text',
        question: 'What are your main learning objectives?',
        required: true,
        order: 2,
      },
    ],
    required: true,
    type: [Object],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  questions: SurveyQuestionData[];

  @ApiProperty({
    description: 'Category of the survey question',
    example: 'before',
    enum: SurveyCategories,
    required: true,
  })
  @IsEnum(SurveyCategories)
  categories: SurveyCategories;
}
