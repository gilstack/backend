import { Controller, Post, Body, Headers } from '@nestjs/common'

// Decorators
import { Ip } from '#/common/decorators'

// Services
import { AuthService } from './auth.service'

// DTOs
import { RequestPassportDto, ValidatePassportDto } from './dto/passport.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('passport')
  requestPassport(@Body() dto: RequestPassportDto) {
    return this.authService.requestPassport(dto)
  }

  @Post('passport/validate')
  async validatePassport(
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
    @Body() dto: ValidatePassportDto
  ) {
    return this.authService.validatePassport({ ...dto, ip, userAgent })
  }
}
