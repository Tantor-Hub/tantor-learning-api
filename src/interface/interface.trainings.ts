export enum TrainingType {
  EN_LIGNE = 'En ligne',
  VISION_CONFERENCE = 'Vision Conférence',
  PRESENTIEL = 'En présentiel',
  HYBRIDE = 'Hybride',
}

export interface ITraining {
  id?: string;
  title: string;
  subtitle?: string;
  id_trainingcategory?: string;
  trainingtype?: TrainingType;
  rnc?: string;
  description?: string;
  requirement?: string;
  pedagogygoals?: string;
  prix?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
