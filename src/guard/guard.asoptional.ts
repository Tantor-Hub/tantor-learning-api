import { ExecutionContext, Injectable } from '@nestjs/common';
import { JwtAuthGuard } from './guard.asglobal';
import { JwtService } from 'src/services/service.jwt';
import { ConfigService } from '@nestjs/config';
import { AllSercices } from 'src/services/serices.all';
import { InjectModel } from '@nestjs/sequelize';
import { Users } from 'src/models/model.users';
import { Request } from 'express';

@Injectable()
export class JwtOptionalAuthGuard extends JwtAuthGuard {
  constructor(
    jwtService: JwtService,
    configService: ConfigService,
    allSercices: AllSercices,
    @InjectModel(Users)
    usersModel: typeof Users,
  ) {
    super(jwtService, configService, allSercices, usersModel);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers[this.keyname] as string;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log(
        'ℹ️ JwtOptionalAuthGuard: No auth header found, continuing as guest for',
        request.url,
      );
      return true;
    }

    return super.canActivate(context);
  }
}

