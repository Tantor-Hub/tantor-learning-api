import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  HttpException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { log } from 'console';
import { Request } from 'express';
import { AllSercices } from 'src/services/serices.all';
import { JwtService } from 'src/services/service.jwt';
import { CustomUnauthorizedException } from 'src/strategy/strategy.unauthorized';

@Injectable()
export class JwtAuthGuardAsSuperviseur implements CanActivate {
  keyname: string;
  allowedTo: string[] = ['admin', 'secretary', 'instructor'];
  accessLevel: number = 92; // c'est à dire que le niveau pour les utilisateurs admins

  constructor(
    private readonly jwtService: JwtService,
    private configService: ConfigService,
    private readonly allSercices: AllSercices,
  ) {
    this.keyname = this.configService.get<string>('APPKEYAPINAME') as string;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers[this.keyname] as string;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new CustomUnauthorizedException(
        "Aucune clé d'authentification n'a éte fournie",
      );
    }
    const [_, token] = authHeader.split(' ');
    const decoded = await this.jwtService.verifyTokenWithRound(token);
    if (!decoded)
      throw new CustomUnauthorizedException(
        "La clé d'authentification fournie a déjà expiré",
      );
    const roles_user = (decoded as any).roles_user as string[] | undefined;
    if (roles_user && roles_user.length) {
      const hasRole = (roles_user as string[]).some((r) =>
        this.allowedTo.includes(r),
      );
      if (!hasRole) {
        throw new CustomUnauthorizedException(
          "La clé d'authentification fournie n'a pas les droits recquis pour accéder à ces ressources",
        );
      }
      request.user = decoded;
      return true;
    }
    // If no roles_user array, allow and let route-level checks handle permissions
    request.user = decoded;
    return true;
  }
}
