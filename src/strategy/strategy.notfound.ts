import { Catch, ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { HttpStatusCode } from 'src/config/config.statuscodes';
import { Responder } from 'src/helpers/helpers.all';

@Catch()
export class NotFoundFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception.status || 404;
        response.status(status).json(Responder({ status: HttpStatusCode.NotFound, data: null }));
    }
}