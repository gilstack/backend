import { ValidationPipe } from '@nestjs/common'
import { Logger } from 'nestjs-pino'
import { env } from 'process'

import type { NestExpressApplication } from '@nestjs/platform-express'

export const bootstrap = async (app: NestExpressApplication): Promise<void> => {
  const logger = app.get(Logger)

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

  // Logger extended
  app.useLogger(logger)

  // Port to running application
  await app.listen(env.SERVER_PORT ?? 8000)
}
