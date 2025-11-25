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
export class JwtAuthGuardAsStudent implements CanActivate {
  keyname: string;
  allowedTo: number[] = [4];
  accessLevel: number = 90;

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
    // Prioritize x-connexion-tantor first, then fall back to configured keyname
    const authHeader =
      (request.headers['x-connexion-tantor'] as string) ||
      (request.headers[this.keyname] as string);

    console.log('🔍 [JWT GUARD STUDENT] Debug Info:');
    console.log('  - Request URL:', request.url);
    console.log('  - Auth header key:', this.keyname);
    console.log('  - Auth header value:', authHeader ? 'Present' : 'Missing');
    console.log('  - All headers:', Object.keys(request.headers));

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log(
        '❌ JwtAuthGuardAsStudent: No valid auth header for',
        request.url,
      );
      console.log('  - Expected format: "Bearer <token>"');
      console.log('  - Received:', authHeader || 'undefined');
      throw new CustomUnauthorizedException(
        "Aucune clé d'authentification n'a éte fournie",
      );
    }

    const [_, token] = authHeader.split(' ');

    console.log(
      '🔑 [JWT GUARD STUDENT] Token received:',
      token ? 'Present' : 'Missing',
    );
    console.log('  - Token length:', token ? token.length : 0);
    console.log(
      '  - Token preview:',
      token ? token.substring(0, 20) + '...' : 'N/A',
    );

    try {
      console.log('🔍 [JWT GUARD STUDENT] Starting token verification...');
      const decoded = await this.jwtService.verifyTokenWithRound(token);

      console.log(
        '🔍 [JWT GUARD STUDENT] Token decoded:',
        JSON.stringify(decoded, null, 2),
      );

      // Check if the response contains an error
      if (!decoded || decoded.error) {
        console.log(
          '❌ JwtAuthGuardAsStudent: Token verification failed for',
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
          '❌ JwtAuthGuardAsStudent: No user ID in token for',
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
          '❌ JwtAuthGuardAsStudent: User not found in database for ID:',
          userId,
        );
        throw new CustomUnauthorizedException('Utilisateur non trouvé');
      }

      // Check if user is verified
      if (user.is_verified === false) {
        console.log('❌ JwtAuthGuardAsStudent: User not verified:', user.email);
        throw new CustomUnauthorizedException(
          "Votre compte n'est pas vérifié. Veuillez contacter un administrateur.",
        );
      }

      // Check if user has student role
      if (user.role !== 'student') {
        console.log(
          '❌ JwtAuthGuardAsStudent: Access denied for',
          user.email,
          '- Role:',
          user.role,
          '(Required: student)',
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
        '✅ JwtAuthGuardAsStudent: User authenticated:',
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
        '❌ JwtAuthGuardAsStudent: Unexpected error for',
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
