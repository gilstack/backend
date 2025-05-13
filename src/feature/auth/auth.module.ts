import { Module } from '@nestjs/common'

// Modules
import { PrismaModule } from '#/prisma/prisma.module'
import { MailModule } from '#/feature/mail/mail.module'
import { UserModule } from '#/feature/user/user.module'

// Controllers
import { AuthController } from '#/feature/auth/auth.controller'

// Services
import { AuthService } from '#/feature/auth/auth.service'

// Strategies
import { PassportStrategy } from './strategies/passport.strategy'

@Module({
  imports: [PrismaModule, MailModule, UserModule],
  controllers: [AuthController],
  providers: [AuthService, PassportStrategy],
  exports: [AuthService]
})
export class AuthModule {}
