import { IGlobale } from './interface.globale';

export interface IMessages extends IGlobale {
  id_user_sender: string;
  id_user_receiver: string;
  is_replied_to?: number | null;
  subject?: string;
  content: string;
  date_d_envoie?: string | Date;
  date_de_lecture?: string | Date;
  piece_jointe?: string | null;
  is_readed: number;
  thread?: string;
  is_deletedto?: string[];
  is_archievedto?: string[];
}
