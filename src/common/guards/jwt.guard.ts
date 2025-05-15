import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Reflector } from '@nestjs/core'
import { JwtService, TokenExpiredError } from '@nestjs/jwt'
import { Request } from 'express'

//Decorators
import { IS_PUBLIC_KEY } from '#/common/decorators'

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private config: ConfigService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ])

    if (isPublic) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const accessToken = this.extractTokenFromHeader(request)

    if (!accessToken) throw new UnauthorizedException('Access token missing')

    try {
      request.user = await this.jwtService.verifyAsync(accessToken, {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET')
      })
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('Access token expired')
      }
      throw new UnauthorizedException('Invalid access token')
    }

    return true
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization
    if (!authHeader) return undefined

    const [type, token] = authHeader.split(' ')
    return type === 'Bearer' && token ? token : undefined
  }
}
