import type { NestExpressApplication } from '@nestjs/platform-express';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { bootstrap } from './bootstrap';
import { AppModule } from './app.module';

const logger = new Logger('Main');

const main = async () => {
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      bufferLogs: true,
    });

    await bootstrap(app);
    logger.log(`App running on port ${process.env.SERVER_PORT ?? 8000}`);
  } catch (error) {
    logger.error(`Failed: ${error}`);
    process.exit(1);
  }
};

main().catch((error) => {
  console.log(error);
  process.exit(1);
});
