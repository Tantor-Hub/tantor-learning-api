import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  HttpException,
  Global,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AllSercices } from 'src/services/serices.all';
import { JwtService } from 'src/services/service.jwt';
import { CustomUnauthorizedException } from 'src/strategy/strategy.unauthorized';

@Injectable()
@Global()
export class JwtAuthGuardAsManagerSystem implements CanActivate {
  keyname: string;
  allowedTo: number[] = [1];
  accessLevel: number = 91; // c'est à dire que le niveau pour les utilisateurs admins

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
    const { roles_user, level_indicator } = decoded;
    if (
      this.allSercices.checkIntersection({
        arr_a: this.allowedTo,
        arr_b: roles_user,
      })
    ) {
      request.user = decoded;
      return true;
    } else
      throw new CustomUnauthorizedException(
        "La clé d'authentification fournie n'a pas les droits recquis pour accéder à ces ressources",
      );
  }
}
