import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'

// Modules
import { PrismaModule } from '#/prisma/prisma.module'
import { MailModule } from '#/feature/mail/mail.module'
import { UserModule } from '#/feature/user/user.module'

// Controllers
import { AuthController } from '#/feature/auth/auth.controller'

// Services
import { AuthService } from '#/feature/auth/auth.service'

// Strategies
import { JwtStrategy } from '#/common/strategies/jwt.strategy'
import { JwtRefreshStrategy } from '#/common/strategies/jwt-refresh.strategy'
import { PassportStrategy } from './strategies/passport.strategy'
import { SessionStrategy } from './strategies/session.strategy'
import { TokenStrategy } from './strategies/token.strategy'

@Module({
  imports: [
    // JWT Access Token
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: config.getOrThrow('JWT_ACCESS_EXPIRES_IN') }
      })
    }),

    // Feat
    PrismaModule,
    MailModule,
    UserModule
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PassportStrategy,
    SessionStrategy,
    TokenStrategy,
    JwtStrategy,
    JwtRefreshStrategy
  ],
  exports: [AuthService]
})
export class AuthModule {}
