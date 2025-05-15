import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateSessionDto {
  @IsOptional()
  @IsString()
  id!: string

  @IsNotEmpty()
  @IsString()
  userId!: string

  @IsNotEmpty()
  @IsString()
  provider!: string

  @IsOptional()
  @IsString()
  ip?: string

  @IsOptional()
  @IsString()
  userAgent?: string

  @IsOptional()
  @IsString()
  browser?: string

  @IsOptional()
  @IsString()
  deviceOs?: string

  @IsOptional()
  @IsString()
  deviceName?: string

  @IsNotEmpty()
  @IsString()
  refreshToken?: string | null

  @IsOptional()
  @IsString()
  revokedAt?: string | null
}
