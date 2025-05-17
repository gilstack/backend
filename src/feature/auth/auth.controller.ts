import { Controller, Post, Body, Headers, UseGuards, Patch } from '@nestjs/common'

// Decorators
import { Ip, Public } from '#/common/decorators'
import { CurrentUser } from '#/feature/user/decorators/current-user.decorator'

// Guards
import { JwtRefreshGuard } from '#/common/guards/jwt-refresh.guard'

// Services
import { AuthService } from './auth.service'

// DTOs
import { RequestPassportDto, ValidatePassportDto } from './dto/passport.dto'
import { RefreshTokenDto } from './dto/token.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('passport')
  passport(@Body() dto: RequestPassportDto) {
    return this.authService.requestPassport(dto)
  }

  @Public()
  @Post('validate')
  async validate(
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
    @Body() dto: ValidatePassportDto
  ) {
    return this.authService.checkPassport({ ...dto, ip, userAgent })
  }

  @UseGuards(JwtRefreshGuard)
  @Patch('refresh')
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshSession(dto)
  }

  @Post('logout')
  async logout(@CurrentUser() user: { sub: string }) {
    return this.authService.logout(user.sub)
  }
}
