import { Module } from '@nestjs/common'

// Users
import { UserService } from './user.service'
import { UserController } from './user.controller'

@Module({
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
