import { Controller, Get, NotFoundException } from '@nestjs/common'

// Decorators
import { CurrentUser } from './decorators/current-user.decorator'

// Services
import { UserService } from './user.service'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async me(@CurrentUser() user: { sub: string }) {
    return await this.userService.getProfile(user.sub)
  }
}
