import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { Response } from 'express';
import { HttpStatusMessages as CustomerMessageServer } from 'src/config/config.statusmessages';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const res = ctx.getResponse<Response>();

    return next.handle().pipe(
      map((data) => {
        if (typeof data?.status === 'string') {
          // Handle custom response like PasswordlessLoginResponder
          const status = data?.statuscode || 200;
          res.status(status);
          return data;
        } else {
          const status = data?.status || 200;
          const HttpStatusMessages: Record<number, string> = {
            200: 'Succès',
            201: 'Création réussie',
            400: 'Requête invalide',
            401: 'Non autorisé',
            403: 'Accès interdit',
            404: 'Ressource introuvable',
            500: 'Erreur interne du serveur',
            ...CustomerMessageServer,
          };

          // Déterminer le message à utiliser
          let message = data?.message || data?.customMessage;

          if (!message) {
            // Si pas de message ou customMessage, essayer d'utiliser les erreurs de validation
            if (
              data?.data?.validationErrors &&
              Array.isArray(data.data.validationErrors)
            ) {
              message = data.data.validationErrors.join('. ');
            } else if (data?.data?.message) {
              message = data.data.message;
            } else {
              message = HttpStatusMessages[status] ?? 'Unknown Error';
            }
          }

          const response: any = {
            status,
            message,
          };

          if (data?.data !== undefined) {
            response.data = data.data;
          }

          console.log('[RESPONSE INTERCEPTOR] 🚀 Final Response:', {
            status,
            message,
            hasData: data?.data !== undefined,
            response,
          });

          res.status(status);
          return response;
        }
      }),
    );
  }
}
