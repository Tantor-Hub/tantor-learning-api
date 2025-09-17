import { PartialType } from '@nestjs/mapped-types';
import { CreateCoursDto } from './create-cours.dto';

export class UpdateCoursDto extends PartialType(CreateCoursDto) {}
