import { LegalDocumentType } from 'src/models/model.legaldocument';

export interface ILegalDocument {
  id?: string;
  type: LegalDocumentType;
  content?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
