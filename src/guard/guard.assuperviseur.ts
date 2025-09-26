import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  HttpException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import { log } from 'console';
import { Request } from 'express';
import { AllSercices } from 'src/services/serices.all';
import { JwtService } from 'src/services/service.jwt';
import { CustomUnauthorizedException } from 'src/strategy/strategy.unauthorized';
import { Users } from 'src/models/model.users';

@Injectable()
export class JwtAuthGuardAsSuperviseur implements CanActivate {
  keyname: string;
  allowedTo: string[] = ['admin', 'secretary', 'instructor'];
  accessLevel: number = 92; // c'est à dire que le niveau pour les utilisateurs admins

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
    console.log('=== JwtAuthGuardAsSuperviseur: Starting ===');
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers[this.keyname] as string;

    console.log('Auth header present:', !!authHeader);
    console.log(
      'Auth header starts with Bearer:',
      authHeader?.startsWith('Bearer '),
    );

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('=== JwtAuthGuardAsSuperviseur: No auth header ===');
      throw new CustomUnauthorizedException(
        "Aucune clé d'authentification n'a éte fournie",
      );
    }

    const [_, token] = authHeader.split(' ');
    console.log('Token extracted:', !!token);

    const decoded = await this.jwtService.verifyTokenWithRound(token);
    console.log('Token decoded:', !!decoded);
    console.log('Decoded token:', decoded);

    if (!decoded) {
      console.log('=== JwtAuthGuardAsSuperviseur: Token expired ===');
      throw new CustomUnauthorizedException(
        "La clé d'authentification fournie a déjà expiré",
      );
    }

    // Get uuid from decoded token and fetch user with roles
    if (!decoded.uuid_user) {
      console.log('=== JwtAuthGuardAsSuperviseur: No uuid_user ===');
      throw new CustomUnauthorizedException(
        "La clé d'authentification ne contient pas d'identifiant utilisateur",
      );
    }

    console.log('=== JwtAuthGuardAsSuperviseur: Fetching user ===');
    console.log('UUID from token:', decoded.uuid_user);

    // Fetch user by uuid
    const user = await this.usersModel.findOne({
      where: { uuid: decoded.uuid_user },
    });

    console.log('User found:', !!user);
    console.log('User role:', user?.role);
    console.log('Allowed roles:', this.allowedTo);

    if (!user) {
      console.log('=== JwtAuthGuardAsSuperviseur: User not found ===');
      throw new CustomUnauthorizedException('Utilisateur non trouvé');
    }

    // Check if user has required role
    if (!this.allowedTo.includes(user.role)) {
      console.log(
        '=== JwtAuthGuardAsSuperviseur: Insufficient permissions ===',
      );
      console.log('User role:', user.role);
      console.log('Required roles:', this.allowedTo);
      throw new CustomUnauthorizedException(
        "La clé d'authentification fournie n'a pas les droits recquis pour accéder à ces ressources",
      );
    }

    // Attach user info to request for downstream handlers
    request.user = {
      ...decoded,
      roles_user: [user.role],
    };

    console.log('=== JwtAuthGuardAsSuperviseur: Success ===');
    console.log('User authenticated:', user.email);
    console.log('User role:', user.role);

    return true;
  }
}
