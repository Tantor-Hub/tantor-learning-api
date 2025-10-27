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
import { Users } from 'src/models/model.users';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class JwtAuthGuardAsFormateur implements CanActivate {
  keyname: string;
  allowedTo: number[] = [1, 2, 3];
  accessLevel: number = 92; // c'est à dire que le niveau pour les utilisateurs admins

  constructor(
    private readonly jwtService: JwtService,
    private configService: ConfigService,
    private readonly allSercices: AllSercices,
    @InjectModel(Users)
    private readonly usersModel: typeof Users,
  ) {
    this.keyname = this.configService.get<string>(
      'APPKEYAPINAME',
      'authorization',
    ) as string;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers[this.keyname] as string;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log(
        '❌ JwtAuthGuardAsFormateur: No valid auth header for',
        request.url,
      );
      throw new CustomUnauthorizedException(
        "Aucune clé d'authentification n'a éte fournie",
      );
    }

    const [_, token] = authHeader.split(' ');

    try {
      const decoded = await this.jwtService.verifyTokenWithRound(token);

      // Check if the response contains an error
      if (!decoded || decoded.error) {
        console.log(
          '❌ JwtAuthGuardAsFormateur: Token verification failed for',
          request.url,
        );

        if (decoded && decoded.type === 'TokenExpiredError') {
          console.log('  - Token has expired');
          console.log('  - Expired at:', decoded.expiredAt);
          throw new CustomUnauthorizedException(
            'Votre session a expiré. Veuillez vous reconnecter.',
          );
        } else if (decoded && decoded.type === 'JsonWebTokenError') {
          console.log('  - Invalid token format');
          throw new CustomUnauthorizedException(
            "Token d'authentification invalide",
          );
        } else {
          console.log(
            '  - Token verification returned null/undefined or unknown error',
          );
          throw new CustomUnauthorizedException(
            "La clé d'authentification fournie a déjà expiré",
          );
        }
      }

      // Check for user ID in token (id_user is the primary field, uuid_user is for backward compatibility)
      const userId = decoded.id_user;

      if (!userId) {
        console.log(
          '❌ JwtAuthGuardAsFormateur: No user ID in token for',
          request.url,
        );
        throw new CustomUnauthorizedException(
          "La clé d'authentification ne contient pas d'identifiant utilisateur",
        );
      }

      // Fetch user by id
      const user = await this.usersModel.findOne({
        where: { id: userId },
      });

      if (!user) {
        console.log(
          '❌ JwtAuthGuardAsFormateur: User not found in database for ID:',
          userId,
        );
        throw new CustomUnauthorizedException('Utilisateur non trouvé');
      }

      // Check if user has required roles (admin, secretary, or instructor)
      const hasRequiredRole = ['admin', 'secretary', 'instructor'].includes(
        user.role,
      );

      if (!hasRequiredRole) {
        console.log(
          '❌ JwtAuthGuardAsFormateur: Access denied for',
          user.email,
          '- Role:',
          user.role,
          '(Required: admin, secretary, instructor)',
        );
        throw new CustomUnauthorizedException(
          "La clé d'authentification fournie n'a pas les droits recquis pour accéder à ces ressources",
        );
      }

      // Attach user info to request for downstream handlers
      request.user = {
        ...decoded,
        roles_user: [user.role],
      };

      console.log(
        '✅ JwtAuthGuardAsFormateur: User authenticated:',
        user.email,
        'for',
        request.url,
      );

      return true;
    } catch (error) {
      if (error instanceof CustomUnauthorizedException) {
        throw error;
      }
      console.log(
        '❌ JwtAuthGuardAsFormateur: Unexpected error for',
        request.url,
        ':',
        error.message,
      );
      throw new CustomUnauthorizedException(
        "La clé d'authentification fournie a déjà expiré",
      );
    }
  }
}
