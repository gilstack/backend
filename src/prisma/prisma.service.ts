import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    try {
      await this.$connect()
    } catch (error) {
      console.error(error)
      throw new Error('Failed to connect to database')
    }
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
