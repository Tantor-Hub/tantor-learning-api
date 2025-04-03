import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, HttpException } from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from 'src/services/service.jwt';
import { CustomUnauthorizedException } from 'src/strategy/strategy.unauthorized';

@Injectable()
export class JwtAuthGuardAsStudent implements CanActivate {
    constructor(private readonly jwtService: JwtService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new CustomUnauthorizedException("Aucune clé d'authentification n'a éte fournie");
        }
        const token = authHeader.split(' ')[1];
        try {
            const decoded = await this.jwtService.verifyToken(token);
            if (!decoded) new CustomUnauthorizedException("La clé d'authentification fournie a déjà expiré");

            request.user = decoded;
            return true;
        } catch (error) {
            throw new CustomUnauthorizedException("Aucune clé d'authentification n'a éte fournie");
        }
    }
}