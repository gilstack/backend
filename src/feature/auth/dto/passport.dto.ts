import { IsNotEmpty, IsEmail } from 'class-validator'

export class RequestPassportDto {
  @IsNotEmpty()
  @IsEmail()
  email!: string
}
