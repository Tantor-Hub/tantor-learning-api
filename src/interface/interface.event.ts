import { IGlobale } from './interface.globale';

export interface IEvent extends IGlobale {
  id?: string;
  title: string;
  description?: string;
  id_cible_training?: string[];
  id_cible_session?: string;
  id_cible_cours?: string;
  id_cible_lesson?: string[];
  id_cible_user?: string[];
  createdBy?: string;
  begining_date: Date;
  beginning_hour: string;
  ending_hour: string;
  qrcode?: string;
  participant?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
