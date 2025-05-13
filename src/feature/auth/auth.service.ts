import { Injectable } from '@nestjs/common'

// Services
import { UserService } from '#/feature/user/user.service'

// DTOs
import { RequestPassportDto } from './dto/passport.dto'

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async requestPassport(dto: RequestPassportDto) {
    // Find user by email
    let user = await this.userService.findByEmail(dto.email)

    // If user does not exist, create user
    if (!user) {
      user = await this.userService.create({ email: dto.email })
    }
  }
}
