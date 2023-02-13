import { AuthPayload, IAuthDocument } from '@auth/interfaces/auth.interface';
import { Request } from 'express';

export interface IJWT {
  jwt?: string;
}

export type IAuthMock = Partial<{
  _id: string;
  username: string;
  email: string;
  uId: string;
  password: string;
  confirmPassword: string;
  avatarColor: string;
  avatarImage: string;
  createdAt: string;
}>;

export interface IAuthRequest extends Request {
  body: IAuthMock;
  currentUser: AuthPayload;
}

export const authMock = {
  uId: '12345678',
  username: 'test',
  email: 'test@gmail.com',
  password: '12345678',
  avatarColor: 'blue',
  createdAt: new Date().toUTCString(),
  passwordResetToken: '',
  passwordResetExpires: '',
  comparePassword: () => {},
  hashPassword: () => {}
} as unknown as IAuthDocument;
