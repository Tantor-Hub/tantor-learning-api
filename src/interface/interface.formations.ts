import { IGlobale } from "./interface.globale";

export interface IFormation extends IGlobale {
    titre: string;
    sous_titre: string;
    piece_jointe?: string; // optionnel
    type_formation: 'onLine' | 'visionConference' | 'presentiel' | 'hybride';
    id_category: number;
    id_formateur: number;
    description: string;
    duree: string;
    start_on: Date;
    end_on: Date;
    prix: number;
}