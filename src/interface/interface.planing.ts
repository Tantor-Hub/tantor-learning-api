import { IGlobale } from "./interface.globale";

export interface IPlanings extends IGlobale {
    titre: string;
    description: string;
    type: 'Examen' | 'Cours' | 'Réunion' | 'Autre';
    id_cibling?: number | null;
}