import { ValidationPipe } from '@nestjs/common'
import { env } from 'process'
import { Logger } from 'nestjs-pino'

import type { NestExpressApplication } from '@nestjs/platform-express'

export const bootstrap = async (app: NestExpressApplication): Promise<void> => {
  //Cross Origins
  app.enableCors({
    origin: env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
  })

  // Pipes validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true
      }
    })
  )

  // Set endpoint prefix
  app.setGlobalPrefix(env.PREFIX ?? 'api')

  // // Logger extended
  // const logger = app.get(Logger)
  // app.useLogger(logger)

  // Port to running application
  await app.listen(env.SERVER_PORT ?? 8000)
}
