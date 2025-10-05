import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { log } from 'console';
import {
  ValidationPipe,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { HttpStatusCode } from './config/config.statuscodes';
import { Responder } from './strategy/strategy.responder';
import { ResponseInterceptor } from './strategy/strategy.responseinterceptor';
import { MediasoupService } from './services/service.mediasoup';
import * as bodyParser from 'body-parser';
import { SwaggerConfig } from './swagger';

async function tantorAPP() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('TANTORPORT', 3000);

  app.enableCors({
    origin: '*', // Allow all origins explicitly
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: '*', // Allow all headers
    exposedHeaders: '*', // Expose all headers
    credentials: false, // Set to false when using wildcard origin
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 86400, // Cache preflight for 24 hours
  });

  // Additional CORS middleware for edge cases
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Methods',
      'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    );
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Credentials', 'false'); // Consistent with main CORS config
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  app.setGlobalPrefix('/api/');
  app.use(bodyParser.json({ limit: '500mb' }));
  app.use(bodyParser.urlencoded({ limit: '500mb', extended: true }));
  app.use(
    '/webhook/stripe/onpayment',
    bodyParser.raw({ type: 'application/json' }),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      forbidUnknownValues: false,
      validationError: {
        target: false,
        value: false,
      },
      exceptionFactory: (errors) => {
        const formatErrors = (errs: any[], parentPath = '') => {
          return errs.flatMap((err) => {
            const fieldPath = parentPath
              ? `${parentPath}.${err.property}`
              : err.property;

            const thisLevelErrors = err.constraints
              ? [{ field: fieldPath, errors: Object.values(err.constraints) }]
              : [];

            const childErrors = err.children?.length
              ? formatErrors(err.children, fieldPath)
              : [];

            return [...thisLevelErrors, ...childErrors];
          });
        };

        const formattedErrors = formatErrors(errors);

        if (formattedErrors.length === 0) {
          return new NotFoundException({
            ...Responder({
              status: HttpStatusCode.NotFound,
              data: {},
            }),
          });
        }

        return new BadRequestException({
          ...Responder({
            status: HttpStatusCode.BadRequest,
            data: formattedErrors,
          }),
        });
      },
    }),
  );

  const mediasoupService = app.get(MediasoupService);
  await mediasoupService.init();
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.enableShutdownHooks();

  // Swagger setup
  SwaggerConfig.setup(app);

  await app.listen(port, '0.0.0.0', () => {
    log('---------------------------------------');
    log(`::: TANTOR APP [STATUS:RUNNING] ON PORT ::: ${port}`);
    log('---------------------------------------');
  });
}

tantorAPP();
