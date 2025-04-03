import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { IJwtValide } from 'src/interface/interface.jwtvalide';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(configService: ConfigService) {
        const secret = configService.get<string>('APPJWTTOKEN', 'JWT_APP_DEFAULT')
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: secret,
        });
    };

    async validate(payload: any): Promise<IJwtValide> {
        return { id_user: payload.userId, email: payload.email, roles: payload.role };
    }
}