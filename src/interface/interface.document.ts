import { IGlobale } from "./interface.globale";

export interface IDocument extends IGlobale {
    id?: number; // optionnel pour la création
    file_name: string;
    url: string;
    type?: string; // ex: 'PDF', 'vidéo', 'Word'...
    id_cours: number;
    id_session: number
    createdBy?: number
}