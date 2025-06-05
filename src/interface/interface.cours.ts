import { IGlobale } from "./interface.globale";

export interface IListcours extends IGlobale {
    id?: number;
    title: string;
    description?: string;
    createdBy?: number;
}

export interface ICours extends IGlobale {
    id?: number;
    id_preset_cours: number;
    duree?: number;
    ponderation?: number;
    is_published?: boolean;
    createdBy?: number;
    id_session: number;
    id_category: number;
    id_thematic?: number;
    id_formateur?: number;
}

export interface IContent extends IGlobale {
    id?: number;
    id_cours: number
    chapitre: string;
    paragraphes: string[]
}

export interface ICoursContent {
    id_cours: number;
    content: IContent[];
}