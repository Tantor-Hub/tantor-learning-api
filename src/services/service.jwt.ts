import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from 'src/strategy/strategy.jwt';
import { CryptoService } from './service.crypto';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('APPJWTTOKEN', 'TANTORSERVICEJWT'),
        signOptions: { expiresIn: configService.get<string>('APPJWTMAXLIFE', '1h') },
      }),
    }),
  ],
  providers: [CryptoService, JwtStrategy],
  exports: [CryptoService],
})

export class JwtAsModule {};
