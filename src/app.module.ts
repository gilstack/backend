import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerGuard } from '@nestjs/throttler'

// Utils
import { ValidateEnv } from '#/common/utils'

// Feat Models
import { PrismaModule } from '#/prisma/prisma.module'
import { ThrottleModule } from '#/common/modules/throttle.module'
import { LoggerModule } from '#/common/modules/logger.module'
import { AuthModule } from '#/feature/auth/auth.module'
import { UserModule } from '#/feature/user/user.module'

@Module({
  imports: [
    //Environment
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env`,
      validate: ValidateEnv,
      cache: true
    }),

    // Modules
    PrismaModule,
    ThrottleModule,
    LoggerModule,
    AuthModule,
    UserModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ]
})
export class AppModule {}
