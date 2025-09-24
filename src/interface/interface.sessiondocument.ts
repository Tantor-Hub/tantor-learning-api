import { IGlobale } from './interface.globale';

export interface ISessiondocument extends IGlobale {
  id?: number;
  title: string;
  description?: string;
  piece_jointe: string;
  type?: string;
  category: string;
  id_session: number;
  createdBy?: number;
}
