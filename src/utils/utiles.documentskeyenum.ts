export const roiplaceholder = `Cette formation a permis aux participants de développer des compétences clés immédiatement mobilisables dans leur environnement professionnel. Elle a notamment contribué à :

Améliorer la productivité : les participants ont acquis des méthodes et outils applicables dès leur retour en poste, réduisant le temps d’exécution de certaines tâches jusqu’à 30 %.

Renforcer la qualité de service : une meilleure compréhension des bonnes pratiques a permis de diminuer les erreurs opérationnelles et d’augmenter la satisfaction client.

Favoriser l’autonomie : les stagiaires se sont montrés plus confiants et proactifs dans la mise en œuvre de leurs missions.

Impacter positivement l’organisation : les compétences acquises ont été partagées en interne, générant un effet de levier sur l’ensemble de l’équipe.`;

export const StepsDocumentsSessionKeys: Record<string, string> = {
  DURING: 'DURING',
  BEFORE: 'BEFORE',
  AFTER: 'AFTER',
};
export const DocumentKeyEnum: Record<string, string> = {
  // Avant la formation
  CARTE_IDENTITE: "Carte d'identité",
  CONTRAT_OU_CONVENTION: 'Contrat ou convention',
  JUSTIFICATIF_DOMICILE: 'Justificatif de domicile',
  ANALYSE_BESOIN: 'Analyse de besoin',
  FORMULAIRE_HANDICAP: 'Formulaire handicap',
  CONVOCATION: 'Convocation',
  PROGRAMME: 'Programme',
  CONDITIONS_VENTE: 'Conditions de vente',
  REGLEMENT_INTERIEUR: 'Règlement intérieur',
  CGV: 'Conditions générales de vente (CGV)',
  FICHE_CONTROLE_INITIALE: 'Fiche de contrôle initiale',

  // Pendant la formation
  CONVOCATION_EXAMEN: "Convocation à l'examen",
  ATTESTATION_FORMATION: 'Attestation de formation',
  CERTIFICATION: 'Certification',
  FICHE_CONTROLE_COURS: 'Fiche de contrôle des cours',
  FICHES_EMARGEMENT: 'Fiches d’émargement',

  // Après la formation
  QUESTIONNAIRE_SATISFACTION: 'Questionnaire de satisfaction',
  PAIEMENT: 'Preuve de paiement',
  DOCUMENTS_FINANCEUR: 'Documents pour le financeur',
  FICHE_CONTROLE_FINALE: 'Fiche de contrôle finale',
};

export const DOCUMENT_KEYS_PHASES = {
  avant_formation: [
    DocumentKeyEnum.CARTE_IDENTITE,
    DocumentKeyEnum.CONTRAT_OU_CONVENTION,
    DocumentKeyEnum.JUSTIFICATIF_DOMICILE,
    DocumentKeyEnum.ANALYSE_BESOIN,
    DocumentKeyEnum.FORMULAIRE_HANDICAP,
    DocumentKeyEnum.CONVOCATION,
    DocumentKeyEnum.PROGRAMME,
    DocumentKeyEnum.CONDITIONS_VENTE,
    DocumentKeyEnum.REGLEMENT_INTERIEUR,
    DocumentKeyEnum.CGV,
    DocumentKeyEnum.FICHE_CONTROLE_INITIALE,
  ],
  pendant_formation: [
    DocumentKeyEnum.CONVOCATION_EXAMEN,
    DocumentKeyEnum.ATTESTATION_FORMATION,
    DocumentKeyEnum.CERTIFICATION,
    DocumentKeyEnum.FICHE_CONTROLE_COURS,
    DocumentKeyEnum.FICHES_EMARGEMENT,
  ],
  apres_formation: [
    DocumentKeyEnum.QUESTIONNAIRE_SATISFACTION,
    DocumentKeyEnum.PAIEMENT,
    DocumentKeyEnum.DOCUMENTS_FINANCEUR,
    DocumentKeyEnum.FICHE_CONTROLE_FINALE,
  ],
};
export enum RequiredDocument {
  CARTE_IDENTITE = 'CARTE_IDENTITE',
  CONTRAT_OU_CONVENTION = 'CONTRAT_OU_CONVENTION',
  JUSTIFICATIF_DOMICILE = 'JUSTIFICATIF_DOMICILE',
  ANALYSE_BESOIN = 'ANALYSE_BESOIN',
  FORMULAIRE_HANDICAP = 'FORMULAIRE_HANDICAP',
  CONVOCATION = 'CONVOCATION',
  PROGRAMME = 'PROGRAMME',
  CONDITIONS_VENTE = 'CONDITIONS_VENTE',
  REGLEMENT_INTERIEUR = 'REGLEMENT_INTERIEUR',
  CGV = 'CGV',
  FICHE_CONTROLE_INITIALE = 'FICHE_CONTROLE_INITIALE',
  CONVOCATION_EXAMEN = 'CONVOCATION_EXAMEN',
  ATTESTATION_FORMATION = 'ATTESTATION_FORMATION',
  CERTIFICATION = 'CERTIFICATION',
  FICHE_CONTROLE_COURS = 'FICHE_CONTROLE_COURS',
  FICHES_EMARGEMENT = 'FICHES_EMARGEMENT',
  QUESTIONNAIRE_SATISFACTION = 'QUESTIONNAIRE_SATISFACTION',
  PAIEMENT = 'PAIEMENT',
  DOCUMENTS_FINANCEUR = 'DOCUMENTS_FINANCEUR',
  FICHE_CONTROLE_FINALE = 'FICHE_CONTROLE_FINALE',
}
