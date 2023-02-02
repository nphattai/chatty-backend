import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { config } from '@root/config';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

export function signToken(data: IAuthDocument, userObjectId: ObjectId | string): string {
  return jwt.sign(
    {
      userId: userObjectId,
      uId: data.uId,
      email: data.email,
      username: data.username,
      avatarColor: data.avatarColor
    },
    config.JWT_TOKEN!,
    { expiresIn: '24h' }
  );
}

export function verifyToken(token: string) {
  return jwt.verify(token, config.JWT_TOKEN!);
}
