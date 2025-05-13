import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Passport, Roles, User } from '@prisma/client'

// Services
import { PrismaService } from '#/prisma/prisma.service'
import { MailService } from '#/feature/mail/mail.service'
import { UserService } from '#/feature/user/user.service'

// DTOs
import { RequestPassportDto, ValidatePassportDto } from '../dto/passport.dto'

@Injectable()
export class PassportStrategy {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly mail: MailService,
    private readonly userService: UserService
  ) {}

  /**
   * Create a new passport for the user
   * @param userId - The user's ID
   * @returns The passport
   */
  async create(userId: string): Promise<Passport> {
    if (!userId) throw new BadRequestException('Data is missing')

    // Expiration date
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30)

    // Create the passport
    const passport = await this.prisma.passport.create({
      data: { userId, expiresAt }
    })

    return passport
  }

  /**
   * Check if the user has a valid passport
   * @param userId - The user's ID
   * @returns The passport if it exists, otherwise null
   */
  async hasValid(userId: string) {
    if (!userId) throw new BadRequestException('Data is missing')

    try {
      const validPassport = await this.prisma.passport.findFirst({
        where: { userId, used: false, expiresAt: { gt: new Date() } }
      })

      if (!validPassport) return null

      const now = new Date()
      const remaining = Math.floor((validPassport.expiresAt.getTime() - now.getTime()) / 1000)

      return { remaining }
    } catch (error) {
      throw new BadRequestException('Error checking valid passport')
    }
  }

  /**
   * Request a passport
   * @param dto - The request passport DTO
   * @returns The message and expiresAt
   */
  async request(dto: RequestPassportDto) {
    // Find user by email,
    let user = await this.userService.findByEmail(dto.email)

    // If not found, create as guest
    if (!user) {
      user = await this.userService.create({ email: dto.email })
    }

    // Check if the user has a valid passport
    const validPassport = await this.hasValid(user.id)

    // If the user has a valid passport
    if (validPassport) {
      // Return the remaining time
      return {
        message: 'Passport already exists',
        remaining: validPassport.remaining
      }
    }

    try {
      // Create passport and return it
      const passport = await this.create(user.id)

      // Generate a link to validate the passport
      let link = `${this.config.get('FRONTEND_URL')}/validate?passport=${passport.id}`

      // Send email with passport link
      await this.mail.sendPassport(user.email, user.name, link)

      return { message: 'Passport sent successfully' }
    } catch (error) {
      throw new BadRequestException('Error sending passport')
    }
  }

  /**
   * Validate a passport
   * @param passportId - The passport ID
   * @returns The passport
   */
  async validate(dto: ValidatePassportDto): Promise<{ user: User }> {
    // Find passport by ID
    const passport = await this.prisma.passport.findUnique({
      where: { id: dto.passport },
      include: { user: true }
    })

    // If not found, throw error
    if (!passport || passport.used || passport.expiresAt < new Date()) {
      throw new BadRequestException('Passport invalid or expired')
    }

    try {
      // Update passport to used
      await this.prisma.passport.update({
        where: { id: dto.passport },
        data: { used: true }
      })

      // Check if user is verified
      if (!passport.user.verified) {
        await this.prisma.user.update({
          where: { id: passport.userId },
          data: {
            verified: true,
            verifiedAt: new Date(),
            role: Roles.USER
          }
        })
      }

      return { user: passport.user }
    } catch (error) {
      throw new BadRequestException('Error validating passport')
    }
  }
}
