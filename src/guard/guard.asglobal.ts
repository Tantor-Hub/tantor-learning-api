import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  HttpException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { JwtService } from 'src/services/service.jwt';
import { CustomUnauthorizedException } from 'src/strategy/strategy.unauthorized';
import { AllSercices } from '../services/serices.all';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  keyname: string;
  allowedTo: string[] = ['student', 'admin', 'secretary', 'instructor'];
  accessLevel: number = 90; // c'est à dire que le niveau pour les utilisateurs

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
    const { uuid_user } = decoded as any;
    if (!uuid_user) {
      throw new CustomUnauthorizedException(
        "La clé d'authentification ne contient pas d'identifiant utilisateur",
      );
    }
    // Backward compatibility: if roles_user exists, allow
    const roles_user = (decoded as any).roles_user;
    if (roles_user && roles_user.length) {
      request.user = decoded;
      return true;
    }
    // Otherwise, accept token presence (role checks handled in specific guards/routes)
    request.user = decoded;
    return true;
  }
}
