import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ConfigModule } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'

// Utils
import { ValidateEnv } from '#/common/utils'

// Feat Models
import { PrismaModule } from '#/prisma/prisma.module'
import { ThrottleModule } from '#/common/modules/throttle.module'
import { LoggerModule } from '#/common/modules/logger.module'
import { AuthModule } from '#/feature/auth/auth.module'
import { UserModule } from '#/feature/user/user.module'

// Guards
import { ThrottlerGuard } from '@nestjs/throttler'
import { JwtAuthGuard } from '#/common/guards'

@Module({
  imports: [
    //Environment
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env`,
      validate: ValidateEnv,
      cache: true
    }),

    // JWT
    JwtModule.register({
      global: true
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
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    }
  ]
})
export class AppModule {}
