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
  console.log('[MAIN] 🚀 Starting TANTOR APP...');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('TANTORPORT', 3000);
  console.log('[MAIN] 📡 Port configured:', port);

  // ✅ CORS setup for credentials & custom headers
  const allowedOrigins = [
    'https://tantorlearning.com',
    'https://www.tantorlearning.com',

    'https://rick-legacy-warming-ontario.trycloudflare.com',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:4200',
    'http://localhost:5173',
    'http://localhost:8080',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:4200',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:8080',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow server-to-server requests
      if (allowedOrigins.includes(origin)) {
        console.log(`[CORS] ✅ Allowed origin: ${origin}`);
        callback(null, true);
      } else {
        console.log(`[CORS] ❌ Blocked origin: ${origin}`);
        console.log(`[CORS] Allowed origins:`, allowedOrigins);
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

  // Add request logging middleware
  app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.originalUrl}`);
    console.log(`[REQUEST] Headers:`, {
      authorization: req.headers.authorization ? 'Bearer [PRESENT]' : 'Missing',
      'content-type': req.headers['content-type'],
      origin: req.headers.origin,
    });
    if (req.body && Object.keys(req.body).length > 0) {
      console.log(`[REQUEST] Body:`, JSON.stringify(req.body, null, 2));
    }
    console.log(
      `[REQUEST] User:`,
      req.user
        ? { id: req.user.id_user || req.user.id, role: req.user.role }
        : 'Not authenticated',
    );

    // Log response
    const originalSend = res.send;
    res.send = function (body) {
      console.log(
        `[RESPONSE] ${res.statusCode} ${req.method} ${req.originalUrl}`,
      );
      if (body && typeof body === 'object') {
        console.log(`[RESPONSE] Body:`, JSON.stringify(body, null, 2));
      }
      return originalSend.call(this, body);
    };

    next();
  });


  app.use(bodyParser.json({ limit: '500mb' }));
  app.use(bodyParser.urlencoded({ limit: '500mb', extended: true }));

  // Add keep-alive headers to prevent Cloudflare 524 timeout
  app.use((req, res, next) => {
    // Set keep-alive headers for long-running requests (file uploads)
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Keep-Alive', 'timeout=600, max=1000');
    // Increase timeout for file upload endpoints
    if (req.path.includes('/create') || req.path.includes('/update')) {
      res.setTimeout(600000); // 10 minutes for upload endpoints
    }
    next();
  });
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
      exceptionFactory: (errors, metatype?) => {
        // Log validation errors
        console.log('=== [VALIDATION ERROR] ===');
        console.log('[URL]', errors[0]?.target?.constructor?.name || 'Unknown');
        console.log('[ERRORS]', JSON.stringify(errors, null, 2));
        // Try to log the target object (the DTO that failed validation)
        if (errors[0]?.target) {
          console.log('[FAILED DTO]', JSON.stringify(errors[0].target, null, 2));
        }
        console.log('==========================');
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
