import { Injectable } from '@nestjs/common';
import { ResponseServer } from '../interface/interface.response';
import { HttpStatusCode } from '../config/statuscodes.config';
import { Responder } from 'src/helpers/helpers.all';

@Injectable()
export class AppService {
  getFallBackEndPoint(): ResponseServer {
    return Responder({status: HttpStatusCode.Ok, data: null})
  }
}
