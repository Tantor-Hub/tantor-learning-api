import { IGlobale } from './interface.globale';

export interface IBookCategory extends IGlobale {
  id?: string;
  title: string;
  createdAt?: Date;
  updatedAt?: Date;
}

