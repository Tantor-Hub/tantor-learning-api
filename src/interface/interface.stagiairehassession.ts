import { IGlobale } from "./interface.globale";

export interface IStagiaireHasSessionSuiivi extends IGlobale {
    id_sessionsuivi: number,
    controleur: string;
    numero_stagiaire: string;
    type_prestation: string;
    date_relance: Date;
    moyen_relance: string;
    reponse_detaillee: string;
    action_a_reprendre: boolean;
    superviseur: string;
    supervision: boolean;
    date_supervision: Date;
    commentaires: string;
}
