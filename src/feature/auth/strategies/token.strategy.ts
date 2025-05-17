import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Roles } from '@prisma/client'

// Services
import { PrismaService } from '#/prisma/prisma.service'

// Strategies
import { SessionStrategy } from './session.strategy'

// DTOs
import { RefreshTokenDto } from '../dto/token.dto'

// Interfaces
import type { AccessPayload, RefreshPayload, Tokens } from '#/common/types'

@Injectable()
export class TokenStrategy {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly sessionStrategy: SessionStrategy
  ) {}

  /**
   * Generate a new access token
   * @param userId - The user to generate the access token for
   * @returns The new access token
   */
  async generateAccessToken(userId: string): Promise<string> {
    // Check if the user exists
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new NotFoundException('User not found')

    // Payload to assign access token
    const payload: AccessPayload = {
      sub: user.id,
      email: user.email,
      role: user.role as Roles,
      type: 'access'
    }

    // Assign and return a new access token
    return this.jwtService.signAsync(payload, {
      expiresIn: this.config.getOrThrow('JWT_ACCESS_EXPIRES_IN'),
      secret: this.config.getOrThrow('JWT_ACCESS_SECRET')
    })
  }

  /**
   * Generate a new refresh token
   * @param sessionId - The session ID to generate the refresh token for
   * @returns The new refresh token
   */
  async generateRefreshToken(sessionId: string): Promise<string> {
    // Check if the session exists
    const session = await this.sessionStrategy.getSession(sessionId)

    // Payload to assign refresh token
    const payload: RefreshPayload = {
      sub: session.userId,
      sessionId: session.id,
      type: 'refresh'
    }

    // Generate the refresh token
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
      expiresIn: this.config.getOrThrow('JWT_REFRESH_EXPIRES_IN')
    })

    // Update the session with the refresh token
    await this.sessionStrategy.update(session.id, refreshToken)

    return refreshToken
  }

  /**
   * Generate a new access and refresh token
   * @param sessionId - The session ID to generate tokens for
   * @returns The new access and refresh tokens
   */
  async generateTokens(sessionId: string): Promise<Tokens> {
    if (!sessionId) throw new BadRequestException('Data is missing')

    // Check if the session exists
    const session = await this.sessionStrategy.getSession(sessionId)

    // Generate the tokens
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(session.userId),
      this.generateRefreshToken(session.id)
    ])

    // Return the tokens
    return { accessToken, refreshToken }
  }

  /**
   * Refresh a session
   * @param dto - The refresh token DTO
   * @returns The tokens and user profile
   */
  async refreshToken(dto: RefreshTokenDto): Promise<Tokens> {
    // Check if the refresh token is provided
    if (!dto.refreshToken) throw new BadRequestException('Refresh token is required')

    try {
      // Decode the refresh token
      const payload = this.jwtService.verify(dto.refreshToken, {
        secret: this.config.getOrThrow('JWT_REFRESH_SECRET')
      })

      // Check if the token is a refresh token
      if (payload.type !== 'refresh') {
        throw new BadRequestException('Invalid refresh type')
      }

      // Check if the session exists
      const sessions = await this.sessionStrategy.getSessions(payload.sub)
      const session = sessions.find((s) => s.refreshToken === dto.refreshToken)

      // Check if the session is valid
      if (!session || session.revokedAt) {
        await this.sessionStrategy.revokeAll(payload.sub)
        throw new UnauthorizedException('Session expired or revoked')
      }

      // Generate new tokens
      return await this.generateTokens(session.id)
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error
      throw new UnauthorizedException('Session expired or revoked')
    }
  }
}
