import { IGlobale } from './interface.globale';
import { SurveyCategories } from 'src/enums/survey-categories.enum';
import { SurveyQuestionData } from './interface.question';

export interface ISurveyQuestion extends IGlobale {
  id?: string;
  title: string;
  id_session: string;
  questions: SurveyQuestionData[];
  categories: SurveyCategories;
  createdBy: string;
  trainingSession?: any;
  creator?: any;
}
