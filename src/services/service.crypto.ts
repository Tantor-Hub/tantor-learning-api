import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CryptoService {
  private readonly saltRounds: number;

  constructor(private readonly configService: ConfigService) {
    this.saltRounds = parseInt(
      this.configService.get<string>('APPSALTLENGTH', '10'),
      10,
    );
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
