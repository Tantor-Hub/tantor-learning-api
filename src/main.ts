import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { log } from 'console';

const {TANTORPORT} = process.env;

const tantorAPP = async () =>{
  const runOn = TANTORPORT ?? 3000;
  const app = await NestFactory.create(AppModule);

  await app.listen(runOn, () => {
    log("---------------------------------------")
    log("::: TANTOR APP [STATUS:RUNNING]:", runOn)
    log("---------------------------------------")
  });
}
tantorAPP();
