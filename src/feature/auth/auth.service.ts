import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'

// Utils
import { parseUserAgent } from '#/common/utils'

// Strategies
import { PassportStrategy } from './strategies/passport.strategy'
import { SessionStrategy } from './strategies/session.strategy'
import { TokenStrategy } from './strategies/token.strategy'

// DTOs
import { ProfileUserDto } from '#/feature/user/dto/profile-user.dto'
import { RequestPassportDto, ValidatePassportDto } from './dto/passport.dto'
import { CreateSessionDto } from './dto/session.dto'
import { RefreshTokenDto } from './dto/token.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly passportStrategy: PassportStrategy,
    private readonly sessionStrategy: SessionStrategy,
    private readonly tokenStrategy: TokenStrategy
  ) {}

  /**
   * Request a passport
   * @param dto - The request passport DTO
   * @returns The message and expiresAt
   */
  async requestPassport(dto: RequestPassportDto): Promise<{ message: string }> {
    await this.passportStrategy.request(dto)
    return { message: 'Passport sent successfully' }
  }

  /**
   * Validate a passport
   * @param dto - The validate passport DTO
   * @returns The user profile and tokens
   */
  async checkPassport(dto: ValidatePassportDto) {
    // Validate the passport
    const { user } = await this.passportStrategy.validate(dto)
    if (!user) throw new BadRequestException('Passport invalid or expired')

    // Parse the user agent
    const { browser, deviceName, deviceOs } = parseUserAgent(dto.userAgent)

    try {
      // Check if the user has any sessions
      let sessions = await this.sessionStrategy.getSessions(user.id)

      // If the user has any sessions, revoke them
      if (sessions.length > 0) {
        await this.sessionStrategy.revokeAll(user.id)
      }

      // Create a new session
      const session = await this.sessionStrategy.create({
        userId: user.id,
        provider: 'passport',
        ip: dto.ip,
        userAgent: dto.userAgent,
        browser,
        deviceName,
        deviceOs
      } as CreateSessionDto)

      // Generate the tokens
      const { accessToken, refreshToken } = await this.tokenStrategy.generateTokens(session.id)

      // Transform the user to a profile user
      const profileUser = plainToInstance(ProfileUserDto, user, {
        excludeExtraneousValues: true
      })

      // Return the tokens and user
      return { ...profileUser, accessToken, refreshToken }
    } catch (error) {
      throw new BadRequestException('Failed to validate passport')
    }
  }

  /**
   * Refresh a session
   * @param sessionId - The session ID
   * @returns The tokens and user profile
   */
  async refreshSession(dto: RefreshTokenDto, sessionId: string) {
    try {
      return await this.tokenStrategy.generateTokens(sessionId)
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token')
    }
  }
}
