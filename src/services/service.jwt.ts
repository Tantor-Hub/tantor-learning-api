import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService as NestJwtService } from '@nestjs/jwt';

export class JwtService {
  constructor(
    private readonly jwtService: NestJwtService,
    private readonly configService: ConfigService,
  ) { }

  async signPayload(payload: any): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('APPJWTTOKEN'),
      expiresIn: this.configService.get<string>('APPJWTMAXLIFE', '1h'),
    });
  }

  async verifyToken(token: string): Promise<any> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('APPJWTTOKEN'),
      });
    } catch (error) {
      return null
    }
  }
}
