import type * as express from 'express'
import type { User } from '@prisma/client'

declare global {
  namespace Express {
    export interface Request {
      user?: User
    }
  }
}

export type AccessPayload = {
  sub: string
  email: string
  role: Roles
  type: string
}

export type AccessToken = {
  accessToken: string
}

export type RefreshPayload = {
  sub: string
  sessionId: string
  type: string
}

export type RefreshToken = {
  refreshToken: string
}

export interface Tokens extends AccessToken, RefreshToken {}
