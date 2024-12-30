import { NestFactory } from '@nestjs/core';
import 'dotenv/config';

import { AppModule } from './app.module';
import { OtherModule } from './other.module';

async function bootstrap() {
  const app = await NestFactory.create(OtherModule);
  await app.listen(process.env.PORT || 3000);
  console.log(`API is running on: ${await app.getUrl()}\n`);

  await NestFactory.createApplicationContext(AppModule);
}

bootstrap();
