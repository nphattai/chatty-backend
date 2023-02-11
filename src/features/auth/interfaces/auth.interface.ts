import { Document } from 'mongoose'
import { IUserDocument } from '@user/interfaces/user.interface'

declare global {
  namespace Express {
    interface Request {
      currentUser?: AuthPayload
    }
  }
}

export interface AuthPayload {
  userId: string
  uId: string
  email: string
  username: string
  avatarColor: string
  iat?: number
}

export interface IAuth {
  uId: string
  username: string
  email: string
  password?: string
  avatarColor: string
  createdAt: Date
  passwordResetToken?: string
  passwordResetExpires?: number | string
}

export interface IAuthDocument extends IAuth, Document {
  comparePassword(password: string): Promise<boolean>
  hashPassword(password: string): Promise<string>
}

export interface IAuthJob {
  value?: string | IAuthDocument | IUserDocument
}
