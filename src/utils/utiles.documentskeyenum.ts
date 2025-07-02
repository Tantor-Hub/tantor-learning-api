export const DocumentKeyEnum: Record<string, string> = {
  // Avant la formation
  CARTE_IDENTITE: "Carte d'identité",
  CONTRAT_OU_CONVENTION: "Contrat ou convention",
  JUSTIFICATIF_DOMICILE: "Justificatif de domicile",
  ANALYSE_BESOIN: "Analyse de besoin",
  FORMULAIRE_HANDICAP: "Formulaire handicap",
  CONVOCATION: "Convocation",
  PROGRAMME: "Programme",
  CONDITIONS_VENTE: "Conditions de vente",
  REGLEMENT_INTERIEUR: "Règlement intérieur",
  CGV: "Conditions générales de vente (CGV)",
  FICHE_CONTROLE_INITIALE: "Fiche de contrôle initiale",

  // Pendant la formation
  CONVOCATION_EXAMEN: "Convocation à l'examen",
  ATTESTATION_FORMATION: "Attestation de formation",
  CERTIFICATION: "Certification",
  FICHE_CONTROLE_COURS: "Fiche de contrôle des cours",
  FICHES_EMARGEMENT: "Fiches d’émargement",

  // Après la formation
  QUESTIONNAIRE_SATISFACTION: "Questionnaire de satisfaction",
  PAIEMENT: "Preuve de paiement",
  DOCUMENTS_FINANCEUR: "Documents pour le financeur",
  FICHE_CONTROLE_FINALE: "Fiche de contrôle finale",
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
        DocumentKeyEnum.FICHE_CONTROLE_INITIALE
    ],
    pendant_formation: [
        DocumentKeyEnum.CONVOCATION_EXAMEN,
        DocumentKeyEnum.ATTESTATION_FORMATION,
        DocumentKeyEnum.CERTIFICATION,
        DocumentKeyEnum.FICHE_CONTROLE_COURS,
        DocumentKeyEnum.FICHES_EMARGEMENT
    ],
    apres_formation: [
        DocumentKeyEnum.QUESTIONNAIRE_SATISFACTION,
        DocumentKeyEnum.PAIEMENT,
        DocumentKeyEnum.DOCUMENTS_FINANCEUR,
        DocumentKeyEnum.FICHE_CONTROLE_FINALE
    ]
};