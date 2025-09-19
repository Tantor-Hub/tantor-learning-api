import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Global,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AllSercices } from 'src/services/serices.all';
import { JwtService } from 'src/services/service.jwt';
import { CustomUnauthorizedException } from 'src/strategy/strategy.unauthorized';
import { Users } from 'src/models/model.users';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
@Global()
export class JwtAuthGuardAsManagerSystem implements CanActivate {
  keyname: string;
  allowedRoles: string[] = ['admin']; // This should match the string role in the Roles table
  accessLevel: number = 91; // c'est à dire que le niveau pour les utilisateurs admins

  constructor(
    @InjectModel(Users)
    private readonly usersModel: typeof Users,
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

    // Debug log decoded token
    console.log('Decoded token:', decoded);

    // Get uuid from decoded token and fetch user with roles
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

    // Check if user has admin role
    if (user.role !== 'admin') {
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
  }
}
