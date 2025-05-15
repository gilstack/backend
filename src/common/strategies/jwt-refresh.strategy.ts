import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { ExtractJwt, Strategy } from 'passport-jwt'

// Services
import { UserService } from '#/feature/user/user.service'

// Strategies
import { SessionStrategy } from '#/feature/auth/strategies/session.strategy'

// Interfaces
import type { RefreshPayload } from '#/common/types'

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private readonly config: ConfigService,
    private readonly userService: UserService,
    private readonly sessionStrategy: SessionStrategy
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      secretOrKey: config.getOrThrow('JWT_REFRESH_SECRET'),
      ignoreExpiration: false,
      passReqToCallback: true
    })
  }

  async validate(req: Request, payload: RefreshPayload) {
    if (!payload?.sub || !payload.sessionId || payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh payload')
    }

    if (!req.body?.refreshToken) {
      throw new UnauthorizedException('Refresh token is required')
    }

    const user = await this.userService.findById(payload.sub)
    if (!user) throw new UnauthorizedException('User not found')

    const session = await this.sessionStrategy.getSession(payload.sessionId)

    if (session.refreshToken !== req.body?.refreshToken) {
      await this.sessionStrategy.revokeAll(payload.sub)
      throw new UnauthorizedException('Invalid refresh token')
    }

    return {
      sub: payload.sub,
      sessionId: payload.sessionId,
      type: payload.type
    } as RefreshPayload
  }
}
