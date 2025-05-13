import { Injectable, Logger } from '@nestjs/common'
import { MailerService } from '@nestjs-modules/mailer'

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name)

  constructor(private readonly mailerService: MailerService) {
    this.logger.log('Mail service initialized with Mailtrap')
  }

  /**
   * Send a passport email
   * @param to - The email address to send the email to
   * @param name - The name of the user
   * @param url - The url of the passport
   */
  async sendPassport(to: string, name: string | null, url: string): Promise<void> {
    try {
      this.logger.debug(`Sending passport to ${to}`)

      await this.mailerService.sendMail({
        to,
        subject: 'Storagie - Passport',
        template: 'send-passport',
        context: {
          name: name ?? 'Anonymous',
          url,
          year: new Date().getFullYear()
        }
      })

      this.logger.log(`Passport sent successfully to ${to}`)
    } catch (error) {
      this.logger.error(`Failed to send passport to ${to}`, error)
      throw error
    }
  }
}
