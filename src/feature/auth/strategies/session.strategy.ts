import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common'
import { Session } from '@prisma/client'

// Services
import { PrismaService } from '#/prisma/prisma.service'

// DTOs
import type { CreateSessionDto } from '../dto/session.dto'

@Injectable()
export class SessionStrategy {
  constructor(private readonly prisma: PrismaService) {}

  async getSessions(userId: string): Promise<Session[]> {
    if (!userId) throw new BadRequestException('Data is missing')

    try {
      const sessions = await this.prisma.session.findMany({
        where: { userId, revokedAt: null }
      })

      if (!sessions) throw new NotFoundException('Sessions not found')

      return sessions
    } catch (error) {
      throw new BadRequestException('Failed to fetch sessions')
    }
  }

  async getSession(sessionId: string): Promise<Session> {
    if (!sessionId) throw new BadRequestException('Data is missing')

    try {
      const session = await this.prisma.session.findUnique({
        where: { id: sessionId }
      })

      if (!session || session.revokedAt) {
        throw new UnauthorizedException('Session expired or revoked')
      }

      return session
    } catch (error) {
      throw new BadRequestException('Failed to fetch session')
    }
  }

  async create(dto: CreateSessionDto): Promise<Session> {
    if (!dto.userId) throw new BadRequestException('Data is missing')

    try {
      return await this.prisma.session.create({ data: dto })
    } catch (error) {
      throw new BadRequestException('Failed to create session')
    }
  }

  async update(sessionId: string, refreshToken: string): Promise<void> {
    const session = await this.prisma.session.findUnique({ where: { id: sessionId } })
    if (!session || session.revokedAt) throw new NotFoundException('Session expired or revoked')

    try {
      await this.prisma.session.update({
        where: { id: sessionId },
        data: {
          refreshToken,
          lastActivity: new Date()
        }
      })
    } catch (error) {
      throw new BadRequestException('Failed to update session')
    }
  }

  async revokeAll(userId: string): Promise<void> {
    if (!userId) throw new BadRequestException('Data is missing')

    try {
      await this.prisma.session.updateMany({
        where: { userId },
        data: { revokedAt: new Date() }
      })
    } catch (error) {
      throw new BadRequestException('Failed to revoke sessions')
    }
  }
}
