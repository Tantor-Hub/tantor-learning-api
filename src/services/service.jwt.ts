import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
  ) { this.round = (this.configService.get<string>('APPROUNDENCRYPT') || 7) as number }

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

  async encryptWithRound(payload: IJwtSignin, isRefres?: boolean): Promise<string> {
    const signature = this.jwtService.sign(payload, {
      secret: isRefres ? this.configService.get<string>('APPJWTREFRESHTOKEN') : this.configService.get<string>('APPJWTTOKEN'),
      expiresIn: isRefres ? this.configService.get<string>('APPJWTREFRESHLIFE', '1h') : this.configService.get<string>('APPJWTMAXLIFE', '1h'),
    });
    let hashed = this.allServices.base64Econde(signature)
    for (let index = 0; index < this.round; index++) hashed = this.allServices.base64Econde(hashed)
    return hashed;
  }

  async decryptWithRound(string: string): Promise<string> {
    let result = this.allServices.base64Decode(string);
    for (let index = 0; index < this.round; index++) {
      result = this.allServices.base64Decode(result);
    }
    return result;
  }

  async signinPayloadAndEncrypt(payload: IJwtSignin): Promise<IMicroServices> {
    return new Promise(async (resolve, reject) => {
      const hashed = await this.encryptWithRound(payload)
      const cleared = await this.decryptWithRound(hashed)
      // delete payload.level_indicator
      // delete (payload as any).uuid_user
      const refresh = await this.encryptWithRound(payload, true)
      try {
        resolve({
          code: 200,
          message: "SignedIn with status [OK]",
          data: { hashed, refresh, cleared }
        });
      } catch (error) {
        reject({ code: 500, message: "Unable to signIn", data: error })
      }
    })
  }

  async verifyTokenWithRound(token: string): Promise<any> {
    try {
      const cleared = await this.decryptWithRound(token)
      const decrypted = await this.jwtService.verifyAsync(cleared, {
        secret: this.configService.get<string>('APPJWTTOKEN'),
      });
      return decrypted
    } catch (error) {
      return null
    }
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

  async verifyRefreshToken(token: string): Promise<any> {
    try {
      const cleared = await this.decryptWithRound(token)
      const decrypted = await this.jwtService.verifyAsync(cleared, {
        secret: this.configService.get<string>('APPJWTREFRESHTOKEN'),
      });
      return decrypted
    } catch (error) {
      return null
    }
  }

  async refreshTokens(payload: IJwtSignin): Promise<IMicroServices> {
    return new Promise((resolve, reject) => {
      this.signinPayloadAndEncrypt(payload)
        .then(_ => resolve(_))
        .catch(_ => reject(_))
    });
  }
}
