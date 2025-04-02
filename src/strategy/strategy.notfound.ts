import { Catch, ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Response, Request } from 'express';
import { HttpStatusCode } from 'src/config/config.statuscodes';
import { Responder } from 'src/strategy/strategy.responder';

@Catch()
export class NotFoundFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception.status || 404;
        const { url, body, method } = ctx.getRequest<Request>();

        response.status(status).json(Responder({
            status: HttpStatusCode.NotFound,
            data: {
                passedUrl: url,
                incomingBody: body,
                usedMethod: method
            }
        }));
    }
}