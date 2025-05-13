import { Module } from '@nestjs/common'

// Modules
import { PrismaModule } from '#/prisma/prisma.module'
import { UserModule } from '#/feature/user/user.module'

// Controllers
import { AuthController } from '#/feature/auth/auth.controller'

// Services
import { AuthService } from '#/feature/auth/auth.service'

@Module({
  imports: [PrismaModule, UserModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService]
})
export class AuthModule {}
