import { Global, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { IJwtSignin } from 'src/interface/interface.payloadjwtsignin';
import { IMicroServices } from 'src/interface/interface.servicesinternesresponses';
import { AllSercices } from './serices.all';

@Injectable()
@Global()
export class JwtService {
  round: number;
  constructor(
    private readonly jwtService: NestJwtService,
    private readonly configService: ConfigService,
    private readonly allServices: AllSercices,
  ) {
    this.round = (this.configService.get<string>('APPROUNDENCRYPT') ||
      7) as number;
  }

  async signinPayload(payload: IJwtSignin): Promise<IMicroServices> {
    return new Promise((resolve, reject) => {
      try {
        resolve({
          code: 200,
          message: 'SignedIn with status successfuly',
          data: this.jwtService.sign(payload, {
            secret: this.configService.get<string>('APPJWTTOKEN'),
            expiresIn: this.configService.get<string>('APPJWTMAXLIFE', '24h'),
          }),
        });
      } catch (error) {
        reject({ code: 500, message: 'Unable to signIn', data: error });
      }
    });
  }

  async encryptWithRound(
    payload: IJwtSignin,
    isRefres?: boolean,
  ): Promise<string> {
    const signature = this.jwtService.sign(payload, {
      secret: isRefres
        ? this.configService.get<string>('APPJWTREFRESHTOKEN')
        : this.configService.get<string>('APPJWTTOKEN'),
      expiresIn: isRefres
        ? this.configService.get<string>('APPJWTREFRESHLIFE', '24h')
        : this.configService.get<string>('APPJWTMAXLIFE', '24h'),
    });
    let hashed = this.allServices.base64Econde(signature);
    for (let index = 0; index < this.round; index++)
      hashed = this.allServices.base64Econde(hashed);
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
      const hashed = await this.encryptWithRound(payload);
      const cleared = await this.decryptWithRound(hashed);
      // delete payload.level_indicator
      // delete (payload as any).uuid_user
      const refresh = await this.encryptWithRound(payload, true);
      try {
        resolve({
          code: 200,
          message: 'SignedIn with status [OK]',
          data: { hashed, refresh, cleared },
        });
      } catch (error) {
        reject({ code: 500, message: 'Unable to signIn', data: error });
      }
    });
  }

  async verifyTokenWithRound(token: string): Promise<any> {
    try {
      console.log('🔍 [JWT SERVICE] Starting token verification with round...');
      console.log('  - Token length:', token.length);
      console.log('  - Round value:', this.round);

      const cleared = await this.decryptWithRound(token);
      console.log('  - Decrypted token length:', cleared.length);
      console.log(
        '  - Decrypted token preview:',
        cleared.substring(0, 50) + '...',
      );

      const decrypted = await this.jwtService.verifyAsync(cleared, {
        secret: this.configService.get<string>('APPJWTTOKEN'),
      });

      console.log('✅ [JWT SERVICE] Token verification successful');
      return decrypted;
    } catch (error) {
      console.log('❌ [JWT SERVICE] Token verification failed:', error.message);
      console.log('  - Error type:', error.name);
      console.log('  - Error stack:', error.stack);

      // Return error details for better handling in guards
      return {
        error: true,
        type: error.name,
        message: error.message,
        expiredAt: error.expiredAt || null,
      };
    }
  }

  async checkTokenWithRound(token: string): Promise<any> {
    try {
      const cleared = await this.decryptWithRound(token);
      const decrypted = await this.jwtService.decode(cleared);
      return decrypted;
    } catch (error) {
      return null;
    }
  }

  async verifyToken(token: string): Promise<any> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('APPJWTTOKEN'),
      });
    } catch (error) {
      return null;
    }
  }

  async verifyRefreshToken(token: string): Promise<any> {
    try {
      const cleared = await this.decryptWithRound(token);
      const decrypted = await this.jwtService.verifyAsync(cleared, {
        secret: this.configService.get<string>('APPJWTREFRESHTOKEN'),
      });
      return decrypted;
    } catch (error) {
      return null;
    }
  }

  async refreshTokens(payload: IJwtSignin): Promise<IMicroServices> {
    return new Promise((resolve, reject) => {
      this.signinPayloadAndEncrypt(payload)
        .then((_) => resolve(_))
        .catch((_) => reject(_));
    });
  }

  /**
   * Check if a token is expired without full verification
   * Useful for providing better error messages
   */
  async isTokenExpired(
    token: string,
  ): Promise<{ expired: boolean; expiredAt?: Date; timeUntilExpiry?: number }> {
    try {
      const cleared = await this.decryptWithRound(token);
      const decoded = await this.jwtService.decode(cleared);

      if (!decoded || !decoded.exp) {
        return { expired: true };
      }

      const now = Math.floor(Date.now() / 1000);
      const exp = decoded.exp;
      const expired = now >= exp;
      const timeUntilExpiry = expired ? 0 : (exp - now) * 1000; // in milliseconds

      return {
        expired,
        expiredAt: expired ? new Date(exp * 1000) : undefined,
        timeUntilExpiry: timeUntilExpiry > 0 ? timeUntilExpiry : 0,
      };
    } catch (error) {
      console.log(
        '❌ [JWT SERVICE] Error checking token expiration:',
        error.message,
      );
      return { expired: true };
    }
  }
}
