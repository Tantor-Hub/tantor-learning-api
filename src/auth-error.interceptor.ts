import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class AuthErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        const request = context.switchToHttp().getRequest();

        // Laisser passer toutes les erreurs d'authentification avec leurs logs
        // Les logs d'authentification sont utiles pour le debugging

        // Pour les autres erreurs, les laisser passer normalement
        return throwError(() => error);
      }),
    );
  }
}
