import { PartialType } from '@nestjs/swagger';
import { CreateLessondocumentDto } from './create-lessondocument.dto';

export class UpdateLessondocumentDto extends PartialType(
  CreateLessondocumentDto,
) {}
