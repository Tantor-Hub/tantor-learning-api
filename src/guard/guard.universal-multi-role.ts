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
import { UserRoles } from 'src/models/model.userroles';
import { InjectModel } from '@nestjs/sequelize';

export interface UniversalRoleOptions {
  requiredRoles: string[];
  requireAll?: boolean; // If true, user must have ALL roles. If false, user needs ANY of the roles
  allowAdminOverride?: boolean; // If true, admin users can access regardless of other roles
}

@Injectable()
@Global()
export class JwtAuthGuardUniversalMultiRole implements CanActivate {
  keyname: string;
  public options: UniversalRoleOptions;

  constructor(
    @InjectModel(Users)
    private readonly usersModel: typeof Users,
    @InjectModel(UserRoles)
    private readonly userRolesModel: typeof UserRoles,
    private readonly jwtService: JwtService,
    private configService: ConfigService,
    private readonly allSercices: AllSercices,
  ) {
    this.keyname = this.configService.get<string>(
      'APPKEYAPINAME',
      'authorization',
    ) as string;
  }

  // Method to set role options dynamically
  setRoleOptions(options: UniversalRoleOptions) {
    this.options = options;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers[this.keyname] as string;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log(
        '❌ JwtAuthGuardUniversalMultiRole: No valid auth header for',
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
          '❌ JwtAuthGuardUniversalMultiRole: Token verification failed for',
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

      // Check for user ID in token
      const userId = decoded.id_user;

      if (!userId) {
        console.log(
          '❌ JwtAuthGuardUniversalMultiRole: No user ID in token for',
          request.url,
        );
        throw new CustomUnauthorizedException(
          "La clé d'authentification ne contient pas d'identifiant utilisateur",
        );
      }

      // Fetch user by id
      const user = await this.usersModel.findOne({
        where: { id: userId },
        include: [
          {
            model: UserRoles,
            where: { is_active: true },
            required: false,
          },
        ],
      });

      if (!user) {
        console.log(
          '❌ JwtAuthGuardUniversalMultiRole: User not found in database for ID:',
          userId,
        );
        throw new CustomUnauthorizedException('Utilisateur non trouvé');
      }

      // Get user roles (both from legacy role field and new userRoles table)
      const userRoles = await this.getUserRoles(user);

      // Check if user has required roles
      const hasRequiredRoles = this.checkUserRoles(userRoles);

      if (!hasRequiredRoles) {
        console.log(
          '❌ JwtAuthGuardUniversalMultiRole: Access denied for',
          user.email,
          '- User roles:',
          userRoles,
          '- Required roles:',
          this.options.requiredRoles,
          '- Require all:',
          this.options.requireAll,
        );
        throw new CustomUnauthorizedException(
          "La clé d'authentification fournie n'a pas les droits requis pour accéder à ces ressources",
        );
      }

      // Attach user info to request for downstream handlers
      request.user = {
        ...decoded,
        roles_user: userRoles,
      };

      console.log(
        '✅ JwtAuthGuardUniversalMultiRole: User authenticated:',
        user.email,
        'with roles:',
        userRoles,
        'for',
        request.url,
      );

      return true;
    } catch (error) {
      if (error instanceof CustomUnauthorizedException) {
        throw error;
      }
      console.log(
        '❌ JwtAuthGuardUniversalMultiRole: Unexpected error for',
        request.url,
        ':',
        error.message,
      );
      throw new CustomUnauthorizedException(
        "La clé d'authentification fournie a déjà expiré",
      );
    }
  }

  private async getUserRoles(user: Users): Promise<string[]> {
    const roles: string[] = [];

    // Add legacy role if it exists
    if (user.role) {
      roles.push(user.role);
    }

    // Add roles from userRoles table
    if (user.userRoles && user.userRoles.length > 0) {
      const activeRoles = user.userRoles
        .filter((ur) => ur.is_active)
        .map((ur) => ur.role);
      roles.push(...activeRoles);
    }

    // Remove duplicates
    return [...new Set(roles)];
  }

  private checkUserRoles(userRoles: string[]): boolean {
    const {
      requiredRoles,
      requireAll = false,
      allowAdminOverride = true,
    } = this.options;

    // Admin override: if user is admin and override is allowed, grant access
    if (allowAdminOverride && userRoles.includes('admin')) {
      return true;
    }

    if (requireAll) {
      // User must have ALL required roles
      return requiredRoles.every((role) => userRoles.includes(role));
    } else {
      // User must have ANY of the required roles
      return requiredRoles.some((role) => userRoles.includes(role));
    }
  }
}
