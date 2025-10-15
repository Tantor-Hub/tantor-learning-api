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
import { AuthErrorInterceptor } from './auth-error.interceptor';
import { MediasoupService } from './services/service.mediasoup';
import * as bodyParser from 'body-parser';
import { SwaggerConfig } from './swagger';

async function tantorAPP() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('TANTORPORT', 3000);

  // ✅ CORS setup for credentials & custom headers
  const allowedOrigins = [
    'https://tantorlearning.com',
    'http://localhost:3000',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow server-to-server requests
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'X-Requested-With',
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'User-Agent',
      'DNT',
      'Cache-Control',
      'X-Connexion-Tantor', // your custom header
    ],
    exposedHeaders: ['Content-Disposition', 'Content-Length', 'X-Request-Id'],
    credentials: true, // needed for cookies/auth
    maxAge: 86400,
  });

  // Middleware to handle preflight requests properly
  app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
      res.header(
        'Access-Control-Allow-Origin',
        allowedOrigins.includes(req.headers.origin as string)
          ? req.headers.origin
          : '',
      );
      res.header(
        'Access-Control-Allow-Methods',
        'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      );
      res.header(
        'Access-Control-Allow-Headers',
        'X-Requested-With,Content-Type,Authorization,Accept,Origin,User-Agent,DNT,Cache-Control,X-Connexion-Tantor',
      );
      res.header('Access-Control-Allow-Credentials', 'true');
      res.sendStatus(204);
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
      transformOptions: { enableImplicitConversion: true },
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
          return new NotFoundException(
            Responder({ status: HttpStatusCode.NotFound, data: {} }),
          );
        }
        return new BadRequestException(
          Responder({
            status: HttpStatusCode.BadRequest,
            data: formattedErrors,
          }),
        );
      },
    }),
  );

  const mediasoupService = app.get(MediasoupService);
  await mediasoupService.init();
  app.useGlobalInterceptors(
    new AuthErrorInterceptor(),
    new ResponseInterceptor(),
  );
  app.enableShutdownHooks();

  // Swagger setup
  SwaggerConfig.setup(app);

  await app.listen(port, '0.0.0.0', () => {
    log('---------------------------------------');
    log(`::: TANTOR APP [STATUS: RUNNING] ON PORT ::: ${port}`);
    log('---------------------------------------');
  });
}

tantorAPP();
