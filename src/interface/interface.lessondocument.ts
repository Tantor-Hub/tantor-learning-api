import { IGlobale } from './interface.globale';

export interface ILessondocument extends IGlobale {
  id?: string;
  file_name: string;
  piece_jointe: string;
  type?: string;
  title?: string;
  description?: string;
  ispublish: boolean;
  id_lesson: string;
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}
