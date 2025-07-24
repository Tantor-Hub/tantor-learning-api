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
    id_category?: number;
    id_thematic?: number;
    id_formateur?: number;
}

export interface IContent extends IGlobale {
    id?: number;
    id_cours: number
    chapitre: string;
    // paragraphes: string[]
}

export interface IChapitres {
    chapitre: string
    id_cours: number;
    paragraphes: string[];
}


export interface IEvaluation {
    id?: number; // optionnel car généré par Sequelize
    title: string;
    description?: string;
    estimatedDuration: number;
    score: number;
    is_finished?: boolean;
    id_cours: number;
    id_session: number
    Cours?: any; // relation optionnelle
    Questions?: any[]; // relation optionnelle
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IQuestion {
    id?: number; // généré automatiquement par Sequelize
    id_evaluation: number;
    content: string;
    type: string; // e.g. "QCM", "QCU", etc.
    Evaluation?: any; // relation optionnelle
    Options?: any[];       // relation optionnelle
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IOption {
    id?: number; // ID généré automatiquement
    id_question: number;
    text: string;
    is_correct?: boolean; // false par défaut
    Question?: any; // relation optionnelle
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IQuestionnaire {
    id?: number;
    titre: string;
    description?: string;
    type: 'sondage';
    questions: IQuestion[];
}

export interface IQuestioninscriptionSession {
    id?: number;
    questionnaireId: number;
    texte: string;
    options: IOption[];
}