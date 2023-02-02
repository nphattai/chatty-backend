import { NextFunction, Request, Response } from 'express';
import { CustomError, NotAuthorizedError } from './error-handler';
import { AuthPayload } from '@auth/interfaces/auth.interface';
import { verifyToken } from './jwt';

export class AuthMiddleware {
  public async checkAuthentication(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers['authorization'];

      const accessToken = authHeader?.split(' ')[1];

      if (!accessToken) {
        throw new NotAuthorizedError('Token is not available. Please login again.');
      }

      const payload = (await verifyToken(accessToken)) as AuthPayload;
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
