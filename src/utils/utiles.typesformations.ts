import { ITypeformation } from 'src/interface/interface.typeformations';

export const typeFormations: ITypeformation[] = [
  {
    key: 'onLine',
    type: 'En ligne',
    description:
      'Une formation en ligne avec tous les supports en ligne, des videos des cours doivent être mis en la dispositions des apprenants',
  },
  {
    key: 'visioConference',
    type: 'Vision Conférence',
    description: 'Une formation en vision conférence',
  },
  {
    key: 'presentiel',
    type: 'En présentiel',
    description: "Une formation organisée au sein d'une centre de formation",
  },
  {
    key: 'hybride',
    type: 'Hybride',
    description:
      "Il s'agit d'une formation qui peut etre dispensée en ligne en vision conference, soit en presentiel",
  },
];

export const typeEvaluation = [
  {
    key: 'pre-conrrige',
    type: 'Pré-corrigé',
    description: 'Une évaluation avec des réponses pré-corrigées',
  },
  {
    key: 'free-writing',
    type: 'Rédaction libre',
    description: "Une évaluation où l'apprenant rédige librement ses réponses",
  },
  {
    key: 'oral',
    type: 'Oral',
    description: 'Une évaluation orale',
  },
];

export const alloedMaterials = [
  {
    key: 'simple_calculator',
    type: 'Calculatrice simple',
    description: 'Une calculatrice basique pour les opérations simples',
  },
  {
    key: 'scientific_calculator',
    type: 'Calculatrice scientifique',
    description: 'Une calculatrice avec des fonctions scientifiques avancées',
  },
  {
    key: 'ruler',
    type: 'Règle graduée',
    description: 'Une règle pour mesurer des distances',
  },
  {
    key: 'protractor',
    type: 'Rapporteur',
    description: 'Un outil pour mesurer des angles',
  },
  {
    key: 'compass',
    type: 'Compas',
    description: 'Un compas pour tracer des cercles',
  },
  {
    key: 'official_form',
    type: 'Formulaire officiel',
    description: "Un formulaire officiel à utiliser pendant l'évaluation",
  },
  {
    key: 'periodic_table',
    type: 'Tableau périodique',
    description: 'Le tableau périodique des éléments chimiques',
  },
  {
    key: 'paper_dictionary',
    type: 'Dictionnaire (papier)',
    description: 'Un dictionnaire papier pour les références linguistiques',
  },
  {
    key: 'printed_reference_text',
    type: 'Texte de référence imprimé',
    description: "Un texte de référence imprimé pour l'évaluation",
  },
  {
    key: 'draft_sheets',
    type: 'Feuilles de brouillon',
    description: 'Des feuilles pour faire des brouillons ou des notes',
  },
  {
    key: 'computer_no_internet',
    type: 'Ordinateur sans connexion Internet',
    description:
      'Un ordinateur sans accès à Internet pour les évaluations informatiques',
  },
  {
    key: 'audio_headset_for_oral_languages',
    type: 'Casque audio (pour oral ou langues)',
    description: 'Un casque audio pour les épreuves orales ou de langues',
  },
  {
    key: 'microphone_for_oral_evaluation',
    type: 'Microphone pour évaluation orale',
    description: 'Un microphone pour les évaluations orales',
  },
  {
    key: 'graphics_tablet_for_drawing_tasks',
    type: 'Tablette graphique pour tâches de dessin',
    description:
      'Une tablette graphique utilisée dans les tâches de dessin ou de conception',
  },
];
