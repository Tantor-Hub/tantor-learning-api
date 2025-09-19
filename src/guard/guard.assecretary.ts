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
import { JwtService } from 'src/services/service.jwt';
import { CustomUnauthorizedException } from 'src/strategy/strategy.unauthorized';
import { AllSercices } from '../services/serices.all';
import { Users } from 'src/models/model.users';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class JwtAuthGuardAsSecretary implements CanActivate {
  keyname: string;
  allowedTo: number[] = [2];
  accessLevel: number = 90;

  constructor(
    private readonly jwtService: JwtService,
    private configService: ConfigService,
    private readonly allSercices: AllSercices,
    @InjectModel(Users)
    private readonly usersModel: typeof Users,
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
    try {
      const decoded = await this.jwtService.verifyTokenWithRound(token);
      if (!decoded)
        throw new CustomUnauthorizedException(
          "La clé d'authentification fournie a déjà expiré",
        );

      if (!decoded.uuid_user) {
        throw new CustomUnauthorizedException(
          "La clé d'authentification ne contient pas d'identifiant utilisateur",
        );
      }

      // Fetch user by uuid
      const user = await this.usersModel.findOne({
        where: { uuid: decoded.uuid_user },
      });

      if (!user) {
        throw new CustomUnauthorizedException('Utilisateur non trouvé');
      }

      // Check if user has secretary role
      if (user.role !== 'secretary') {
        throw new CustomUnauthorizedException(
          "La clé d'authentification fournie n'a pas les droits recquis pour accéder à ces ressources",
        );
      }

      // Attach user info to request for downstream handlers
      request.user = {
        ...decoded,
        roles_user: [user.role],
      };

      return true;
    } catch (error) {
      log(error);
      throw new CustomUnauthorizedException(
        "La clé d'authentification fournie a déjà expiré",
      );
    }
  }
}
