export interface ITrainingSession {
  id?: string;
  id_trainings: string;
  title: string;
  nb_places: number;
  available_places: number;
  required_document_before?: string[];
  required_document_during?: string[];
  required_document_after?: string[];
  payment_method?: string[];
  survey?: string[];
  regulation_text: string;
  begining_date: Date;
  ending_date: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
