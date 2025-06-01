import { IGlobale } from './interface.globale';

export interface IHomeworksSessions extends IGlobale {
    id_session: number;
    homework_date_on: number;
    id_formation?: number;
    piece_jointe?: string;
    score: number,
    id_cours: number
}