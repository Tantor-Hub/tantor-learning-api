import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AllSercices } from 'src/services/serices.all';
import { JwtService } from 'src/services/service.jwt';
import { CustomUnauthorizedException } from 'src/strategy/strategy.unauthorized';
import { Users } from 'src/models/model.users';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class JwtAuthGuardAsInstructor implements CanActivate {
  keyname: string;
  allowedRoles: string[] = ['instructor']; // Only instructors allowed
  accessLevel: number = 93; // Access level for instructors

  constructor(
    @InjectModel(Users)
    private readonly usersModel: typeof Users,
    private readonly jwtService: JwtService,
    private configService: ConfigService,
    private readonly allSercices: AllSercices,
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
        '❌ JwtAuthGuardAsInstructor: No valid auth header for',
        request.url,
      );
      throw new CustomUnauthorizedException(
        "Aucune clé d'authentification n'a été fournie",
      );
    }

    const [_, token] = authHeader.split(' ');

    try {
      const decoded = await this.jwtService.verifyTokenWithRound(token);

      // Check if the response contains an error
      if (!decoded || decoded.error) {
        console.log(
          '❌ JwtAuthGuardAsInstructor: Token verification failed for',
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
          '❌ JwtAuthGuardAsInstructor: No user ID in token for',
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
          '❌ JwtAuthGuardAsInstructor: User not found in database for ID:',
          userId,
        );
        throw new CustomUnauthorizedException('Utilisateur non trouvé');
      }

      // Check if user has instructor role only
      if (!this.allowedRoles.includes(user.role)) {
        console.log(
          '❌ JwtAuthGuardAsInstructor: Access denied for',
          user.email,
          '- Role:',
          user.role,
          '(Required: instructor)',
        );
        throw new CustomUnauthorizedException(
          'Seuls les instructeurs peuvent accéder à cette ressource',
        );
      }

      // Attach user info to request for downstream handlers
      request.user = {
        ...decoded,
        roles_user: [user.role],
      };

      console.log(
        '✅ JwtAuthGuardAsInstructor: User authenticated:',
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
        '❌ JwtAuthGuardAsInstructor: Unexpected error for',
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
