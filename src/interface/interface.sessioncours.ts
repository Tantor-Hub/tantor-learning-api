export interface ISessionCours {
  id?: string;
  title?: string;
  description?: string;
  is_published?: boolean;
  createdBy?: string;
  CreatedBy?: any;
  id_session?: string;
  trainingSession?: any;
  id_formateur?: string[];
  lessons?: any[];
  createdAt?: Date;
  updatedAt?: Date;
}
