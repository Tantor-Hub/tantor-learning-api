import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { log } from 'console';
import { NotFoundFilter } from './strategy/strategy.notfound';
import { ValidationPipe, BadRequestException } from '@nestjs/common';

async function tantorAPP() {

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('TANTORPORT', 3000);
  app.setGlobalPrefix('/api/');
  app.useGlobalFilters(new NotFoundFilter());
  app.useGlobalPipes(new ValidationPipe({
    exceptionFactory: (errors) => {
      return new BadRequestException(errors.map(err => ({
        field: err.property,
        errors: Object.values(err.constraints || {})
      })));
    }
  }));

  await app.listen(port, () => {
    log("---------------------------------------");
    log(`::: TANTOR APP [STATUS:RUNNING] ON PORT: ${port}`);
    log("---------------------------------------");
  });
}

tantorAPP();
