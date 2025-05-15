import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

// Services
import { UserService } from '#/feature/user/user.service'

// Interfaces
import type { AccessPayload } from '#/common/types'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: ConfigService,
    private readonly userService: UserService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.getOrThrow('JWT_ACCESS_SECRET'),
      ignoreExpiration: false
    })
  }

  async validate(payload: AccessPayload) {
    if (!payload?.sub || !payload.email) {
      throw new UnauthorizedException('Invalid access payload')
    }

    const user = await this.userService.findById(payload.sub)
    if (!user) throw new UnauthorizedException('User not found')

    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      type: payload.type
    } as AccessPayload
  }
}
