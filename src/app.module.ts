import { Module } from '@nestjs/common'

// Prisma
import { PrismaService } from '#/prisma/prisma.service'

// App
import { AppController } from '#/app.controller'
import { AppService } from '#/app.service'

// Feat Models
import { AuthModule } from '#/feature/auth/auth.module'
import { UserModule } from './feature/user/user.module'

@Module({
  imports: [AuthModule, UserModule],
  controllers: [AppController],
  providers: [AppService, PrismaService]
})
export class AppModule {}
