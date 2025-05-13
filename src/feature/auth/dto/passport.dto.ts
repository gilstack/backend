import { IsNotEmpty, IsEmail, IsString, IsOptional } from 'class-validator'

export class RequestPassportDto {
  @IsNotEmpty()
  @IsEmail()
  email!: string
}

export class ValidatePassportDto {
  @IsString()
  @IsNotEmpty()
  passport!: string

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  ip!: string

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  userAgent!: string
}
