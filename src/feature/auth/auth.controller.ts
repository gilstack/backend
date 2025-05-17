import {
  Controller,
  Post,
  Body,
  Headers,
  UseGuards,
  Patch,
  Res,
  Req,
  UnauthorizedException
} from '@nestjs/common'
import { Response, type Request } from 'express'

// Decorators
import { Ip, Public } from '#/common/decorators'
import { CurrentUser } from '#/feature/user/decorators/current-user.decorator'

// Guards
import { JwtRefreshGuard } from '#/common/guards/jwt-refresh.guard'

// Services
import { AuthService } from './auth.service'

// DTOs
import { RequestPassportDto, ValidatePassportDto } from './dto/passport.dto'

// Constants
import { REFRESH_TOKEN } from '#/common/constants'

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
    @Body() dto: ValidatePassportDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const newSession = await this.authService.checkPassport({ ...dto, ip, userAgent })

    res.cookie(REFRESH_TOKEN, newSession.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 1 // 1 day
    })

    // Return only the accessToken and public data
    const { refreshToken, ...safeData } = newSession
    return safeData
  }

  @UseGuards(JwtRefreshGuard)
  @Patch('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.[REFRESH_TOKEN]

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token found in cookie')
    }

    const { accessToken, refreshToken: newRefreshToken } = await this.authService.refreshSession({
      refreshToken
    })

    res.cookie(REFRESH_TOKEN, newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24
    })

    return { accessToken }
  }

  @Post('logout')
  async logout(@CurrentUser() user: { sub: string }) {
    return this.authService.logout(user.sub)
  }
}
