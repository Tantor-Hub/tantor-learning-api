import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { log } from 'console';
import { Request } from 'express';
import { JwtService } from 'src/services/service.jwt';
import { CustomUnauthorizedException } from 'src/strategy/strategy.unauthorized';

@Injectable()
export class JwtAuthGuardAsStudent implements CanActivate {
    keyname: string;
    constructor(private readonly jwtService: JwtService, private configService: ConfigService) {
        this.keyname = (this.configService.get<string>('APPKEYAPINAME')) as string
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const authHeader = request.headers[this.keyname] as string;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new CustomUnauthorizedException("Aucune clé d'authentification n'a éte fournie");
        }
        const [_, token] = authHeader.split(" ");
        try {
            const decoded = await this.jwtService.verifyTokenWithRound(token);
            if (!decoded) throw new CustomUnauthorizedException("La clé d'authentification fournie a déjà expiré");

            request.user = decoded;
            return true;
        } catch (error) {
            throw new CustomUnauthorizedException("La clé d'authentification fournie a déjà expiré");
        }
    }
}