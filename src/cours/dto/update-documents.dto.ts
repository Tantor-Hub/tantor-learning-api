import { PartialType } from '@nestjs/mapped-types';
import { CreateDocumentDto } from './create-documents.dto';

export class UpdateDocumentDto extends PartialType(CreateDocumentDto) {}
