import { PartialType } from '@nestjs/swagger';
import { CreateEvaluationQuestionOptionDto } from './create-evaluationquestionoption.dto';

export class UpdateEvaluationQuestionOptionDto extends PartialType(
  CreateEvaluationQuestionOptionDto,
) {}
