import { BadRequestException, Injectable } from '@nestjs/common'

// Utils
import { parseUserAgent } from '#/common/utils'

// Strategies
import { UserService } from '#/feature/user/user.service'
import { PassportStrategy } from './strategies/passport.strategy'

// DTOs
import { RequestPassportDto, ValidatePassportDto } from './dto/passport.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly passportStrategy: PassportStrategy,
    private readonly userService: UserService
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
   * @param passportId - The passport ID
   * @returns The passport
   */
  async validatePassport(dto: ValidatePassportDto) {
    const { user } = await this.passportStrategy.validate(dto)
    if (!user) throw new BadRequestException('Passport invalid or expired')

    const { browser, deviceName, deviceOs } = parseUserAgent(dto.userAgent)
  }
}
