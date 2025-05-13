import { z } from 'zod'

export const envSchema = z.object({
  // Application
  MODE: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number(),
  PREFIX: z.string(),

  // CORS
  ALLOWED_ORIGINS: z.string(),

  // Frontend
  FRONTEND_URL: z.string().url(),

  // Database
  DATABASE_URL: z.string().url(),

  // Throttler
  THROTTLE_LIMIT: z.coerce.number(),
  THROTTLE_TTL: z.coerce.number(),

  // Cache
  CACHE_TTL: z.coerce.number(),

  // Mail
  MAIL_HOST: z.string(),
  MAIL_PORT: z.coerce.number(),
  MAIL_USER: z.string(),
  MAIL_PASS: z.string(),
  MAIL_FROM_NAME: z.string(),
  MAIL_FROM_EMAIL: z.string().email()
})

export type Env = z.infer<typeof envSchema>
