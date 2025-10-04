import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export class SwaggerConfig {
  static setup(app: INestApplication) {
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

    SwaggerModule.setup('api', app, document, {
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
  }
}
