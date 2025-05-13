import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MailerModule } from '@nestjs-modules/mailer'
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'
import * as path from 'path'

import { MailService } from './mail.service'

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get<string>('MAIL_HOST'),
          port: config.get<number>('MAIL_PORT'),
          auth: {
            user: config.get<string>('MAIL_USER'),
            pass: config.get<string>('MAIL_PASS')
          },
          secure: config.get<boolean>('MAIL_SECURE')
        },
        defaults: {
          from: `"${config.get<string>('MAIL_FROM_NAME')}"
          <${config.get<string>('MAIL_FROM_EMAIL')}>`
        },
        template: {
          dir: path.join(process.cwd(), 'src/feature/mail/templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true
          }
        }
      })
    })
  ],
  providers: [MailService],
  exports: [MailService]
})
export class MailModule {}
