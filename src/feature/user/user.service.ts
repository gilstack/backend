import { Injectable, ConflictException } from '@nestjs/common'

// Utils
import { nameFromEmail } from '#/common/utils'

// Services
import { PrismaService } from '#/prisma/prisma.service'

// DTOs
import { CreateUserDto } from './dto/create-user.dto'

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const user = await this.findByEmail(createUserDto.email)
    if (user) throw new ConflictException('User already exists')

    const name = createUserDto.name ?? nameFromEmail(createUserDto.email)
    return await this.prisma.user.create({ data: { ...createUserDto, name } })
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } })
  }
}
