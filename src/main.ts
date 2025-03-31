import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { log } from 'console';

async function tantorAPP() {

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('TANTORPORT', 3000);
  app.setGlobalPrefix('/api/');

  await app.listen(port, () => {
    log("---------------------------------------");
    log(`::: TANTOR APP [STATUS:RUNNING] ON PORT: ${port}`);
    log("---------------------------------------");
  });
}

tantorAPP();
