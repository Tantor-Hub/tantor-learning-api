import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { IJwtSignin } from 'src/interface/interface.payloadjwtsignin';
import { IMicroServices } from 'src/interface/interface.servicesinternesresponses';

export class JwtService {
  constructor(
    private readonly jwtService: NestJwtService,
    private readonly configService: ConfigService,
  ) { }

  async signPayload(payload: IJwtSignin): Promise<IMicroServices> {
    return new Promise((resolve, reject) => {
      try {
        resolve({
          code: 200,
          message: "SignedIn with status successfuly",
          data: this.jwtService.signAsync(payload, {
            secret: this.configService.get<string>('APPJWTTOKEN'),
            expiresIn: this.configService.get<string>('APPJWTMAXLIFE', '1h'),
          })
        });
      } catch (error) {
        reject({ code: 500, message: "Unable to signIn", data: error })
      }
    })
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
