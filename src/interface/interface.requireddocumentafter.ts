export interface IRequiredDocumentAfter {
  id?: string; // Made optional for creation
  id_training_session: string; // UUID from TrainingSession
  document_name: string; // Name of the required document
  description?: string; // Optional description
  is_mandatory: boolean; // Whether the document is mandatory
  createdAt?: Date;
  updatedAt?: Date;
}
