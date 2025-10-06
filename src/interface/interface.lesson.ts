import { IGlobale } from './interface.globale';

export interface IListlesson extends IGlobale {
  id?: string;
  title: string;
  description?: string;
  ispublish?: boolean;
  id_cours: string;
  sessionCours?: any;
  createdBy?: number;
}
