import { IGlobale } from "./interface.globale";

export interface IStagiaireHasSessionSuiivi extends IGlobale {
    id_sessionsuivi: number,
    id_stagiaire: number;
    supervision?: boolean;
    numero_stagiaire?: string;
    date_mise_a_jour: string | Date;
    id_formation: number;
}
