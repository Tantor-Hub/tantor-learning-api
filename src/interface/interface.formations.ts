import { IGlobale } from "./interface.globale";

export interface IFormation extends IGlobale {
    titre: string;
    sous_titre: string;
    id_category: number;
    
    type_formation?: 'onLine' | 'visionConference' | 'presentiel' | 'hybride';
    piece_jointe?: string; // optionnel
    id_formateur?: number;
    description?: string;
    duree?: string;
    start_on?: Date;
    end_on?: Date;
    prix?: number;
}