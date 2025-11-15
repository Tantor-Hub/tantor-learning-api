import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export class SwaggerConfig {
  static setup(app: INestApplication) {
    const configService = app.get(ConfigService);
    const nodeEnv = configService.get<string>('NODE_ENV', 'development');
    const enableSwagger = configService.get<string>('ENABLE_SWAGGER', 'true').toLowerCase() === 'true';
    
    // Security: Disable Swagger in production unless explicitly enabled
    const isProduction = nodeEnv === 'production';
    if (isProduction && !enableSwagger) {
      console.log('[SWAGGER] ⚠️  Swagger is disabled in production for security');
      return;
    }

    // Get Swagger credentials from environment
    const swaggerUser = configService.get<string>('SWAGGER_USER', 'admin');
    const swaggerPassword = configService.get<string>('SWAGGER_PASSWORD', '');
    const swaggerPath = configService.get<string>('SWAGGER_PATH', 'api');
    
    // In production, password is required for security
    if (isProduction && !swaggerPassword) {
      console.log('[SWAGGER] ⚠️  Swagger password not set in production. Disabling Swagger for security.');
      return;
    }

    const config = new DocumentBuilder()
      .setTitle('Tantor API')
      .setDescription('API documentation for Tantor Learning')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);

    // Sort tags alphabetically
    if (document.tags) {
      document.tags.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Sort operations within each path alphabetically
    Object.keys(document.paths).forEach((path) => {
      const pathItem = document.paths[path];
      const sortedOperations: any = {};

      // Define the order of HTTP methods for consistent sorting
      const methodOrder = [
        'get',
        'post',
        'put',
        'patch',
        'delete',
        'head',
        'options',
      ];

      methodOrder.forEach((method) => {
        if (pathItem[method]) {
          sortedOperations[method] = pathItem[method];
        }
      });

      // Add any remaining methods that weren't in our predefined order
      Object.keys(pathItem).forEach((method) => {
        if (!sortedOperations[method] && typeof pathItem[method] === 'object') {
          sortedOperations[method] = pathItem[method];
        }
      });

      document.paths[path] = sortedOperations;
    });

    // Sort paths alphabetically
    const sortedPaths: any = {};
    Object.keys(document.paths)
      .sort((a, b) => a.localeCompare(b))
      .forEach((path) => {
        sortedPaths[path] = document.paths[path];
      });

    document.paths = sortedPaths;

    // Add basic authentication middleware only in production
    // In development, Swagger is open without authentication
    // In production, authentication is required (password must be set in env)
    if (isProduction) {
      // Password check already done above, but double-check for safety
      if (!swaggerPassword) {
        console.log('[SWAGGER] ⚠️  Production requires password but none provided. Disabling Swagger.');
        return;
      }

      app.use((req, res, next) => {
        // Protect Swagger UI and JSON endpoints
        // Check both path and originalUrl to handle global prefix
        const path = req.path || req.originalUrl?.split('?')[0] || '';
        const isSwaggerPath = 
          path === `/${swaggerPath}` || 
          path === `/${swaggerPath}-json` ||
          path.startsWith(`/${swaggerPath}/`) ||
          path.includes(`/${swaggerPath}-json`) ||
          path.includes(`/${swaggerPath}/`);
        
        if (isSwaggerPath) {
          const auth = req.headers.authorization;
          if (!auth || !auth.startsWith('Basic ')) {
            res.setHeader('WWW-Authenticate', 'Basic realm="Swagger Documentation"');
            return res.status(401).send('Authentication required');
          }

          try {
            const credentials = Buffer.from(auth.split(' ')[1], 'base64').toString().split(':');
            const [username, password] = credentials;

            if (username !== swaggerUser || password !== swaggerPassword) {
              res.setHeader('WWW-Authenticate', 'Basic realm="Swagger Documentation"');
              return res.status(401).send('Invalid credentials');
            }
          } catch (error) {
            res.setHeader('WWW-Authenticate', 'Basic realm="Swagger Documentation"');
            return res.status(401).send('Invalid authentication format');
          }
        }
        next();
      });
    }

    SwaggerModule.setup(swaggerPath, app, document, {
      swaggerOptions: {
        // Additional Swagger UI options for better organization
        tagsSorter: 'alpha', // Sort tags alphabetically in UI
        operationsSorter: 'alpha', // Sort operations alphabetically in UI
        docExpansion: 'none', // Collapse all operations by default
        filter: true, // Enable search/filter functionality
        showRequestHeaders: true,
        showCommonExtensions: true,
      },
    });

    if (isProduction) {
      console.log(`[SWAGGER] 🔒 Swagger is enabled in production at /${swaggerPath} with authentication`);
      console.log(`[SWAGGER] 📝 Username: ${swaggerUser}`);
    } else {
      console.log(`[SWAGGER] ✅ Swagger documentation available at /${swaggerPath} (open in development)`);
    }
  }
}
