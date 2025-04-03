import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from 'src/services/service.jwt';

@Injectable()
export class JwtAuthGuardAsStudent implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1]; // Récupérer le token après "Bearer "

    try {
      const decoded = await this.jwtService.verifyToken(token);
      if (!decoded) throw new UnauthorizedException('Invalid token');

      request.user = decoded; // Injecte l'utilisateur décodé dans la requête
      return true;
    } catch (error) {
      throw new UnauthorizedException('Unauthorized');
    }
  }
}