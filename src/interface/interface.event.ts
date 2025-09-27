import { IGlobale } from './interface.globale';

export interface IEvent extends IGlobale {
  id?: string;
  title: string;
  description?: string;
  id_cible_training?: string[];
  id_cible_session?: string[];
  id_cible_cours?: string[];
  id_cible_lesson?: string[];
  id_cible_user?: string[];
  begining_date: Date;
  ending_date?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
