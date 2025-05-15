import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common'

// Utils
import { nameFromEmail } from '#/common/utils'

// Services
import { PrismaService } from '#/prisma/prisma.service'

// DTOs
import { CreateUserDto } from './dto/create-user.dto'
import { ProfileUserDto } from './dto/profile-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    return await this.prisma.user.findUnique({ where: { id } })
  }

  async findByEmail(email: string) {
    return await this.prisma.user.findUnique({ where: { email } })
  }

  async create(createUserDto: CreateUserDto) {
    const user = await this.findByEmail(createUserDto.email)
    if (user) throw new ConflictException('User already exists')

    const name = createUserDto.name ?? nameFromEmail(createUserDto.email)
    return await this.prisma.user.create({ data: { ...createUserDto, name } })
  }

  async update(updateUserDto: UpdateUserDto) {
    return await this.prisma.user.update({
      where: { id: updateUserDto.id },
      data: updateUserDto
    })
  }

  async getProfile(sub: string): Promise<ProfileUserDto> {
    if (!sub) throw new BadRequestException('Data is missing')

    const profile = await this.prisma.user.findUnique({
      where: { id: sub },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        wallet: true,
        verified: true
      }
    })

    if (!profile) throw new UnauthorizedException('User not found')

    return profile
  }
}
