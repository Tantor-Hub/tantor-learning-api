import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('APPJWTTOKEN', 'defaultSecret'),
    });
  }

  async validate(payload: any) {
    // The payload contains the decoded JWT token
    // You can add additional validation here if needed
    return {
      id_user: payload.id_user,
      uuid_user: payload.uuid_user,
      level_indicator: payload.level_indicator,
    };
  }
}
