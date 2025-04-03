import { Injectable } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { IJwtSignin } from 'src/interface/interface.payloadjwtsignin';
import { IMicroServices } from 'src/interface/interface.servicesinternesresponses';
import { AllSercices } from './serices.all';

@Injectable()
export class JwtService {
  round: number;
  constructor(
    private readonly jwtService: NestJwtService,
    private readonly configService: ConfigService,
    private readonly allServices: AllSercices
  ) {
    this.round = (this.configService.get<string>('APPROUNDENCRYPT') || 7) as number
  }

  async signinPayload(payload: IJwtSignin): Promise<IMicroServices> {
    return new Promise((resolve, reject) => {
      try {
        resolve({
          code: 200,
          message: "SignedIn with status successfuly",
          data: this.jwtService.sign(payload, {
            secret: this.configService.get<string>('APPJWTTOKEN'),
            expiresIn: this.configService.get<string>('APPJWTMAXLIFE', '1h'),
          })
        });
      } catch (error) {
        reject({ code: 500, message: "Unable to signIn", data: error })
      }
    })
  }

  async encryptWithRound(payload: IJwtSignin): Promise<string> {
    const signature = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('APPJWTTOKEN'),
      expiresIn: this.configService.get<string>('APPJWTMAXLIFE', '1h'),
    });
    let hashed = this.allServices.base64Econde(signature)
    for (let index = 0; index < this.round; index++) hashed = this.allServices.base64Econde(hashed)
    return hashed;
  }

  async decryptWithRound(string: string): Promise<string> {
    let result = this.allServices.base64Decode(string)
    for (let index = 0; index < this.round; index++) result = this.allServices.base64Decode(string)
    return result;
  }

  async signinPayloadAndEncrypt(payload: IJwtSignin): Promise<IMicroServices> {
    return new Promise(async (resolve, reject) => {
      const hashed = await this.encryptWithRound(payload)
      const cleared = await this.decryptWithRound(hashed)
      try {
        resolve({
          code: 200,
          message: "SignedIn with status successfuly",
          data: { hashed, cleared, roud: this.round }
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
