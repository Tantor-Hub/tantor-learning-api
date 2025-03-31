import { Injectable } from '@nestjs/common';
import { ResponseServer } from '../interface/interface.response';
import { HttpStatusCode } from '../config/statuscodes.config';
import { Responder } from 'src/helpers/helpers.all';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) { }

  getFallBackEndPoint(): ResponseServer {
    const appName = this.configService.get<string>('APPNAME', 'DefaultAppName');
    const appOwner = this.configService.get<string>('APPOWNER', 'DefaultOwner');
    return Responder({ status: HttpStatusCode.Ok, data: { appOwner, appName } })
  }
}
