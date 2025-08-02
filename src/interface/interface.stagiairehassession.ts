import { IGlobale } from "./interface.globale";

export interface IStagiaireHasSessionSuiivi extends IGlobale {
    id?: number;
    id_sessionsuivi: number,
    id_stagiaire: number;
    supervision?: boolean;
    numero_stagiaire?: string;
    date_mise_a_jour: string | Date;
    id_formation: number;
    is_started?: number // 1: yes 0 otherWhise
    id_payement?: number;
}

export interface ISurveyResponse extends IGlobale {
    id?: number;
    id_question: number;
    answer: string;
    id_stagiaire_session?: number;
}
