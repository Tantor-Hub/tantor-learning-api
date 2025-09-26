export interface QuestionOption {
  id: string;
  text: string;
}

export interface SurveyQuestionData {
  id: string;
  type: 'multiple_choice' | 'text' | 'rating' | 'yes_no';
  question: string;
  options?: QuestionOption[]; // Only for multiple choice questions
  required: boolean;
  order: number;
  maxSelections?: number; // For multiple choice: how many options can be selected
}
