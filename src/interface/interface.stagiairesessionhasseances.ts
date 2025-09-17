import { IGlobale } from './interface.globale';

export interface IStagiaireHasSessionSuiiviSeance extends IGlobale {
  id_sessionsuivi: number;
  id_stagiaire: number;
  supervision: boolean;
  numero_stagiaire: string;
  date_mise_a_jour: string | Date;
  id_formation: number;
  date_de_seance: number;

  seance_time?: number;
  date_supervision?: Date;
  id_controleur?: number;
  id_superviseur?: number;
  type_prestation?: string;
  date_relance?: Date;
  moyen_relance?: string;
  reponse_detaillee?: string;
  action_a_reprendre?: boolean;
}
