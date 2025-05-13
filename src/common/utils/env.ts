import { envSchema } from '#/common/validations/env.validation'

export function ValidateEnv(config: Record<string, unknown>) {
  const result = envSchema.safeParse(config)

  if (!result.success) {
    console.error('Invalid environment variables:', result.error.format())
    throw new Error('Invalid .env configuration')
  }

  return result.data
}
