import { IGlobale } from './interface.globale';

export interface IHomeWorks extends IGlobale {
  id_session: number;
  id_user: number;
  id_formation?: number;
  date_de_creation: string | Date;
  date_de_remise: number | string | Date;
  piece_jointe?: string;
  score: number;
  score_on: number;
  id_cours: number;
  is_returned: number; // 1 deja remis par l'etudiant 0 othewhise
}
