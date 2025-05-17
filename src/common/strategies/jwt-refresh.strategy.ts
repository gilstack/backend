import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { Request } from 'express'

// Services
import { UserService } from '#/feature/user/user.service'
import { SessionStrategy } from '#/feature/auth/strategies/session.strategy'

// Types
import type { RefreshPayload } from '#/common/types'

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private readonly config: ConfigService,
    private readonly userService: UserService,
    private readonly sessionStrategy: SessionStrategy
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return req?.cookies?.storagie_session || null
        }
      ]),
      secretOrKey: config.getOrThrow('JWT_REFRESH_SECRET'),
      ignoreExpiration: false,
      passReqToCallback: true
    })
  }

  async validate(req: Request, payload: RefreshPayload) {
    if (!payload?.sub || !payload.sessionId || payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh payload')
    }

    const refreshToken = req.cookies?.storagie_session
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token cookie missing')
    }

    const user = await this.userService.findById(payload.sub)
    if (!user) throw new UnauthorizedException('User not found')

    const session = await this.sessionStrategy.getSession(payload.sessionId)

    if (!session || session.refreshToken !== refreshToken) {
      await this.sessionStrategy.revokeAll(payload.sub)
      throw new UnauthorizedException('Invalid refresh token or session revoked')
    }

    return {
      sub: payload.sub,
      sessionId: payload.sessionId,
      type: payload.type
    } as RefreshPayload
  }
}
