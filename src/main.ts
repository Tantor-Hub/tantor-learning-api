import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { log } from 'console';

const tantorAPP = async () =>{
  const runOn = process.env.TANTORPORT ?? 3000;
  const app = await NestFactory.create(AppModule);
  
  await app.listen(runOn, () => {
    log("---------------------------------------")
    log("::: TANTOR APP [STATUS:RUNNING]:", runOn)
    log("---------------------------------------")
  });
}
tantorAPP();
