import { IGlobale } from "./interface.globale";

export interface ISessionSuivi extends IGlobale {
    uuid?: string;
    piece_jointe?: string;
    type_formation?: 'onLine' | 'visionConference' | 'presentiel' | 'hybride';
    id_formation: number;
    id_category?: number;
    id_thematic?: number;

    id_controleur?: number;
    id_superviseur?: number;
    date_mise_a_jour?: Date | string | any;
    date_session_debut: Date | string;
    date_session_fin: Date | string;
    duree: string;
    prix?: number;
    description: string;
    designation?: string;

    // controleur?: number;
    // type_prestation: 'formation' | 'cbs';
    // date_relance: Date;
    // moyen_relance: string;
    // reponse_detaillee: string;
    // action_a_reprendre: boolean;
    // superviseur: string;
    // supervision: boolean;
    // date_supervision: Date;
}
