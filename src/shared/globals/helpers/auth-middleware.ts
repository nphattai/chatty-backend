import { config } from '@root/config';
import JWT from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { CustomError, NotAuthorizedError } from './error-handler';
import { AuthPayload } from '@auth/interfaces/auth.interface';

export class AuthMiddleware {
  public async checkAuthentication(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.session?.jwt) {
        throw new NotAuthorizedError('Token is not available. Please login again.');
      }

      const payload = (await JWT.verify(req.session.jwt, config.JWT_TOKEN!)) as AuthPayload;
      req.currentUser = payload;

      if (!req.currentUser) {
        throw new NotAuthorizedError('Authentication is required to access this route.');
      }
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      } else {
        throw new NotAuthorizedError('Token is invalid. Please login again.');
      }
    }

    next();
  }
}

export const authMiddleware = new AuthMiddleware();
