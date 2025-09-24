import { QuestionType } from 'src/utils/utiles.typesprestation';
import { IGlobale } from './interface.globale';

export interface IListcours extends IGlobale {
  id?: number;
  title: string;
  description?: string;
  createdBy?: number;
}

export interface ICours extends IGlobale {
  id?: number;
  title?: string;
  description?: string;
  ponderation?: number;
  is_published?: boolean;
  createdBy?: number;
  id_session?: number;
  id_category?: number;
  id_thematic?: number;
  id_formateur?: string;
}

export interface IOption {
  id?: number; // ID généré automatiquement
  text: string;
  is_correct?: boolean; // false par défaut
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IQuestionnaire {
  id?: number;
  titre: string;
  is_required?: boolean;
  id_questionnaire?: number;
  description?: string;
  type: QuestionType; // Type de question
  options?: IOption[];
}

export interface IQuestioninscriptionSession extends IGlobale {
  id?: number;
  id_session: number;
  description?: string;
  created_by: number;
  Questionnaires?: IQuestionnaire[];
}
