import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  email!: string

  @IsString()
  @IsOptional()
  name?: string
}
