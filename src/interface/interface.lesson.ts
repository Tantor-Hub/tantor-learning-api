import { IGlobale } from './interface.globale';

export interface IListlesson extends IGlobale {
  id?: number;
  title: string;
  description?: string;
  id_cours: number;
  createdBy?: number;
}
