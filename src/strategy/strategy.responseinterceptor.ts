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

        const response = {
          status,
          message:
            data?.customMessage ??
            HttpStatusMessages[status] ??
            'Unknown Error',
          data: data?.data ?? null,
        };

        res.status(status);
        return response;
      }),
    );
  }
}
