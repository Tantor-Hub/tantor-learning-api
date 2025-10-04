import { PartialType } from '@nestjs/swagger';
import { CreateEvaluationQuestionDto } from './create-evaluationquestion.dto';

export class UpdateEvaluationQuestionDto extends PartialType(
  CreateEvaluationQuestionDto,
) {}
