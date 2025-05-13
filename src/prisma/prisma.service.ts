import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name)

  constructor() {
    super({
      log: process.env.APP_MODE === 'production' ? ['error'] : ['query', 'warn', 'error'],
      errorFormat: process.env.APP_MODE === 'production' ? 'minimal' : 'pretty'
    })
  }

  async onModuleInit() {
    try {
      await this.$connect()
      this.logger.log('Connected to the database!')
    } catch (error) {
      this.logger.error(`Database connection failed: ${error}`)
      throw error
    }
  }

  async onModuleDestroy() {
    await this.$disconnect()
    this.logger.log('Disconnected from the database!')
  }
}
