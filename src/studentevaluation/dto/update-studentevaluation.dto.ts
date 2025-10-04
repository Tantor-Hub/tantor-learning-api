import { PartialType } from '@nestjs/swagger';
import { CreateStudentevaluationDto } from './create-studentevaluation.dto';

export class UpdateStudentevaluationDto extends PartialType(
  CreateStudentevaluationDto,
) {}
