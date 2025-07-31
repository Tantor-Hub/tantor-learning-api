import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { log } from 'console';
import { ValidationPipe, BadRequestException, NotFoundException } from '@nestjs/common';
import { HttpStatusCode } from './config/config.statuscodes';
import { Responder } from './strategy/strategy.responder';
import { ResponseInterceptor } from './strategy/strategy.responseinterceptor';
import { MediasoupService } from './services/service.mediasoup';

async function tantorAPP() {

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('TANTORPORT', 3000);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  app.setGlobalPrefix('/api/');
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    validationError: {
      target: false,
      value: false,
    },
    exceptionFactory: (errors) => {
      if (errors.length === 0) {
        return new NotFoundException({
          ...Responder({
            status: HttpStatusCode.NotFound,
            data: {}
          })
        });
      }

      return new BadRequestException({
        ...Responder({
          status: HttpStatusCode.BadRequest, data: errors.map(err => ({
            field: err.property,
            errors: Object.values(err.constraints || {})
          }))
        })
      });
    }
  }));

  const mediasoupService = app.get(MediasoupService);
  await mediasoupService.init();
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.enableShutdownHooks();

  await app.listen(port, () => {
    log("---------------------------------------");
    log(`::: TANTOR APP [STATUS:RUNNING] ON PORT: ${port}`);
    log("---------------------------------------");
  });
}

tantorAPP();
