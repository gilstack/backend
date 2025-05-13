import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class ProfileUserDto {
  @IsString()
  @IsNotEmpty()
  id!: string

  @IsString()
  @IsOptional()
  name!: string

  @IsEmail()
  @IsNotEmpty()
  email!: string

  @IsString()
  @IsOptional()
  image!: string

  @IsNumber()
  @IsOptional()
  wallet!: number
}
