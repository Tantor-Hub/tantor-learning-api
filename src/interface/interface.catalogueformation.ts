export enum CatalogueType {
  USER = 'user',
  STUDENT = 'student',
  INSTRUCTOR = 'instructor',
  SECRETARY = 'secretary',
  ADMIN = 'admin',
}

export interface ICatalogueFormation {
  id?: string;
  type: CatalogueType;
  title: string;
  description?: string;
  piece_jointe?: string;
  id_training?: string;
  createdBy: string; // UUID of user
  createdAt?: Date;
  updatedAt?: Date;
}
