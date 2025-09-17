import { HttpStatusMessages as StatusMesage } from 'src/config/config.statusmessages';

export const Responder = ({
  status,
  data,
  customMessage,
}: {
  status: number;
  data?: any;
  customMessage?: string;
}) => {
  const HttpStatusMessages: Record<number, string> = {
    200: 'Succès',
    201: 'Création réussie',
    400: 'Requête invalide',
    401: 'Non autorisé',
    403: 'Accès interdit',
    404: 'Ressource introuvable',
    500: 'Erreur interne du serveur',
    ...StatusMesage,
  };

  return {
    status,
    message: customMessage ?? HttpStatusMessages[status] ?? 'Unknown Error',
    data: data ?? null,
  };
};
