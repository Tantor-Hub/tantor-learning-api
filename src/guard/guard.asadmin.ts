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
  allowedRoles: string[] = ['admin', 'secretary']; // This should match the string role in the Roles table
  accessLevel: number = 91; // c'est à dire que le niveau pour les utilisateurs admins ou secrétaires

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
    
    // Skip authentication for Swagger UI endpoints ONLY
    // IMPORTANT: This should only match actual Swagger documentation paths, not API endpoints
    const swaggerPath = this.configService.get<string>('SWAGGER_PATH', 'api');
    const path = request.path || request.url?.split('?')[0] || '';
    const originalUrl = request.originalUrl?.split('?')[0] || '';
    
    // Strictly check for Swagger paths only (not API endpoints)
    // Only allow paths that are explicitly Swagger documentation endpoints
    const swaggerPaths = [
      `/${swaggerPath}`,
      `/${swaggerPath}-json`,
      `/api/${swaggerPath}`,
      `/api/${swaggerPath}-json`,
      swaggerPath,
      `${swaggerPath}-json`,
    ];
    
    // Use strict matching - only exact matches or paths that start with swagger paths
    // Do NOT use includes() as it could match API endpoints incorrectly
    const isSwaggerPath = 
      swaggerPaths.some(sp => {
        const normalizedSp = sp.startsWith('/') ? sp : `/${sp}`;
        return path === normalizedSp || 
               path === sp ||
               originalUrl === normalizedSp ||
               originalUrl === sp ||
               (path.startsWith(`${normalizedSp}/`) && path.split('/').length === 2) ||
               (originalUrl.startsWith(`${normalizedSp}/`) && originalUrl.split('/').length === 2);
      });
    
    if (isSwaggerPath) {
      // Allow Swagger paths to pass through (they have their own basic auth)
      // But log this to help debug if it's incorrectly matching
      console.log(
        '⚠️ JwtAuthGuardAsManagerSystem: Bypassing auth for Swagger path:',
        request.url,
      );
      return true;
    }
    
    // Debug: Log header lookup
    console.log(
      '🔍 JwtAuthGuardAsManagerSystem: Checking auth headers for',
      request.url,
    );
    console.log('  - Configured keyname (APPKEYAPINAME):', this.keyname);
    console.log('  - Header value from keyname:', request.headers[this.keyname] ? 'PRESENT' : 'MISSING');
    console.log('  - Header value from x-connexion-tantor:', request.headers['x-connexion-tantor'] ? 'PRESENT' : 'MISSING');
    
    // Prioritize x-connexion-tantor first, then fall back to configured keyname
    const authHeader =
      (request.headers['x-connexion-tantor'] as string) ||
      (request.headers[this.keyname] as string);
    
    if (authHeader) {
      const headerSource = request.headers['x-connexion-tantor'] ? 'x-connexion-tantor' : this.keyname;
      console.log('  - ✅ Using token from header:', headerSource);
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log(
        '❌ [401 UNAUTHORIZED] JwtAuthGuardAsManagerSystem: Missing or invalid auth header',
      );
      console.log('  - URL:', request.url);
      console.log('  - Reason: MISSING TOKEN');
      if (!authHeader) {
        console.log('  - No auth header found in request');
      } else if (!authHeader.startsWith('Bearer ')) {
        console.log('  - Auth header found but does not start with "Bearer "');
        console.log('  - Header value starts with:', authHeader.substring(0, 20));
      }
      console.log('  - Available auth-related headers:', Object.keys(request.headers).filter(k => 
        k.toLowerCase().includes('auth') || 
        k.toLowerCase().includes('connexion') || 
        k.toLowerCase().includes('token') ||
        k.toLowerCase() === 'x-connexion-tantor'
      ));
      throw new CustomUnauthorizedException(
        "Aucune clé d'authentification n'a éte fournie",
      );
    }
    
    console.log('  - ✅ Auth header found, length:', authHeader.length);
    
    // Confirm we're using token from x-connexion-tantor
    const tokenSource = request.headers['x-connexion-tantor'] ? 'x-connexion-tantor' : this.keyname;
    console.log('  - 📍 Token source confirmed:', tokenSource);

    const [_, token] = authHeader.split(' ');
    console.log('  - Token extracted, length:', token?.length || 0);
    console.log('  - Token preview (first 50 chars):', token?.substring(0, 50) || 'N/A');

    try {
      console.log('  - 🔐 Verifying token from', tokenSource, '...');
      const decoded = await this.jwtService.verifyTokenWithRound(token);
      console.log('  - Token decoded successfully:', decoded ? 'YES' : 'NO');
      if (decoded) {
        console.log('  - Decoded token keys:', Object.keys(decoded));
      }

      // Check if the response contains an error
      if (!decoded || decoded.error) {
        console.log(
          '❌ [401 UNAUTHORIZED] JwtAuthGuardAsManagerSystem: Token verification failed',
        );
        console.log('  - URL:', request.url);

        if (decoded && decoded.type === 'TokenExpiredError') {
          console.log('  - Reason: EXPIRED TOKEN');
          console.log('  - Token has expired');
          console.log('  - Expired at:', decoded.expiredAt);
          throw new CustomUnauthorizedException(
            'Votre session a expiré. Veuillez vous reconnecter.',
          );
        } else if (decoded && decoded.type === 'JsonWebTokenError') {
          console.log('  - Reason: BAD TOKEN (Invalid token format)');
          console.log('  - Error message:', decoded.message);
          throw new CustomUnauthorizedException(
            "Token d'authentification invalide",
          );
        } else {
          console.log('  - Reason: BAD TOKEN (Verification failed)');
          console.log('  - Token verification returned null/undefined or unknown error');
          if (decoded) {
            console.log('  - Error type:', decoded.type);
            console.log('  - Error message:', decoded.message);
          }
          throw new CustomUnauthorizedException(
            "La clé d'authentification fournie a déjà expiré",
          );
        }
      }

      // Check for user ID in token (id_user is the primary field, uuid_user is for backward compatibility)
      const userId =
        decoded.id_user ||
        decoded.id ||
        decoded.uuid_user ||
        decoded.userId ||
        decoded.user_id;

      console.log('  - Extracted userId:', userId);
      console.log('  - UserId sources checked:', {
        id_user: decoded.id_user,
        id: decoded.id,
        uuid_user: decoded.uuid_user,
        userId: decoded.userId,
        user_id: decoded.user_id,
      });

      if (!userId) {
        console.log(
          '❌ [401 UNAUTHORIZED] JwtAuthGuardAsManagerSystem: No user ID in token',
        );
        console.log('  - URL:', request.url);
        console.log('  - Reason: BAD TOKEN (Missing user ID)');
        console.log('  - Decoded token does not contain id_user, id, uuid_user, userId, or user_id');
        throw new CustomUnauthorizedException(
          "La clé d'authentification ne contient pas d'identifiant utilisateur",
        );
      }

      // Fetch user by id
      console.log('  - 🔍 Looking up user in database with ID:', userId);
      const user = await this.usersModel.findOne({
        where: { id: userId },
      });
      console.log('  - User found:', user ? `YES (${user.email}, role: ${user.role})` : 'NO');

      if (!user) {
        console.log(
          '❌ [401 UNAUTHORIZED] JwtAuthGuardAsManagerSystem: User not found in database',
        );
        console.log('  - URL:', request.url);
        console.log('  - Reason: USER NOT FOUND');
        console.log('  - User ID from token:', userId);
        console.log('  - User does not exist in database');
        throw new CustomUnauthorizedException('Utilisateur non trouvé');
      }

      // Check if user is verified
      if (user.is_verified === false) {
        console.log(
          '❌ [401 UNAUTHORIZED] JwtAuthGuardAsManagerSystem: User not verified',
        );
        console.log('  - URL:', request.url);
        console.log('  - Reason: USER NOT VERIFIED');
        console.log('  - User email:', user.email);
        console.log('  - User account is not verified');
        throw new CustomUnauthorizedException(
          "Votre compte n'est pas vérifié. Veuillez contacter un administrateur.",
        );
      }

      // Check if user has admin or secretary role
      if (!this.allowedRoles.includes(user.role)) {
        console.log(
          '❌ [401 UNAUTHORIZED] JwtAuthGuardAsManagerSystem: Access denied - insufficient role',
        );
        console.log('  - URL:', request.url);
        console.log('  - Reason: INSUFFICIENT PERMISSIONS');
        console.log('  - User email:', user.email);
        console.log('  - User role:', user.role);
        console.log('  - Required roles:', this.allowedRoles.join(', '));
        throw new CustomUnauthorizedException(
          "La clé d'authentification fournie n'a pas les droits recquis pour accéder à ces ressources",
        );
      }

      // Attach user info to request for downstream handlers
      // This req.user is populated from the token in x-connexion-tantor header
      request.user = {
        ...decoded,
        id_user: userId,
        id: userId,
        roles_user: [user.role],
      };

      console.log(
        '✅ JwtAuthGuardAsManagerSystem: User authenticated:',
        user.email,
        'for',
        request.url,
      );
      console.log('  - ✅ req.user set from x-connexion-tantor token');
      console.log('  - req.user.id_user:', userId);
      console.log('  - req.user.roles_user:', [user.role]);

      // CRITICAL: Verify req.user was set before returning true
      const userPayload = request.user as any;
      if (!userPayload || !userPayload.id_user) {
        console.error(
          '🚨 CRITICAL ERROR: req.user was not set properly after authentication!',
        );
        console.error('  - request.user:', request.user);
        console.error('  - This should never happen - throwing error');
        throw new CustomUnauthorizedException(
          'Erreur interne: authentification échouée',
        );
      }

      return true;
    } catch (error) {
      if (error instanceof CustomUnauthorizedException) {
        throw error;
      }
      console.log(
        '❌ [401 UNAUTHORIZED] JwtAuthGuardAsManagerSystem: Unexpected error',
      );
      console.log('  - URL:', request.url);
      console.log('  - Reason: TOKEN VERIFICATION ERROR');
      console.log('  - Error type:', error.name);
      console.log('  - Error message:', error.message);
      console.log('  - Error stack:', error.stack);
      throw new CustomUnauthorizedException(
        "La clé d'authentification fournie a déjà expiré",
      );
    }
  }
}
