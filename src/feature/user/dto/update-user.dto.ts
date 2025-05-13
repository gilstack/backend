import { PartialType } from '@nestjs/mapped-types'

import { ProfileUserDto } from './profile-user.dto'

export class UpdateUserDto extends PartialType(ProfileUserDto) {}
