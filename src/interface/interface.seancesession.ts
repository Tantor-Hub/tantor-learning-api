import { IGlobale } from './interface.globale';

export interface ISeanceSession extends IGlobale {
    id_session: number;
    duree: number;
    seance_date_on: number;
    type_seance?: string;
    id_formation?: string;
    piece_jointe?: string;
}
