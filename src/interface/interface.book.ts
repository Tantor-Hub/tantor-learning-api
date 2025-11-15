import { IGlobale } from './interface.globale';
import { BookStatus } from 'src/models/model.book';

export interface IBook extends IGlobale {
  id?: string;
  title: string;
  description?: string;
  session?: string[];
  author?: string;
  createby: string;
  status: BookStatus;
  category?: string[]; // Array of BookCategory IDs
  icon?: string;
  piece_joint?: string;
  views?: number;
  download?: number;
  public?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

