import { Controller, Post, Body } from '@nestjs/common'

// Services
import { AuthService } from './auth.service'

// DTOs
import { RequestPassportDto } from './dto/passport.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('passport')
  requestPassport(@Body() dto: RequestPassportDto) {
    return this.authService.requestPassport(dto)
  }
}
