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
      const tokens = await this.tokenStrategy.generateTokens(session.id)

      // Return the tokens and user
      return { id: user.id, email: user.email, verified: user.verified, ...tokens }
    } catch (error) {
      throw new BadRequestException('Failed to validate passport')
    }
  }

  /**
   * Refresh a session
   * @param dto - The refresh token DTO
   * @param sessionId - The session ID
   * @returns The tokens and user profile
   */
  async refreshSession(dto: RefreshTokenDto) {
    if (!dto.refreshToken) throw new BadRequestException('Data is missing')

    try {
      return await this.tokenStrategy.refreshToken(dto)
    } catch (error) {
      throw new UnauthorizedException('Failed to refresh session')
    }
  }

  /**
   * Logout a user
   * @param sub - The user ID
   * @returns The message
   */
  async logout(userId: string) {
    if (!userId) throw new BadRequestException('Data is missing')

    try {
      await this.sessionStrategy.revokeAll(userId)
      return { message: 'Logged out successfully' }
    } catch (error) {
      throw new BadRequestException('Failed to logout')
    }
  }
}
