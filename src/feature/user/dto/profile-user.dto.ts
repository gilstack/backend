import { Expose } from 'class-transformer'
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID
} from 'class-validator'

export class ProfileUserDto {
  @Expose()
  @IsUUID()
  @IsNotEmpty()
  @IsOptional()
  id!: string

  @Expose()
  @IsString()
  @IsOptional()
  name!: string

  @Expose()
  @IsEmail()
  @IsNotEmpty()
  email!: string

  @Expose()
  @IsString()
  @IsOptional()
  image?: string | null

  @Expose()
  @IsNumber()
  @IsOptional()
  wallet!: number

  @Expose()
  @IsBoolean()
  @IsOptional()
  verified!: boolean
}
