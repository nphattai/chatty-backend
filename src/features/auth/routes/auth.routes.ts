import { Auth } from '@auth/controllers/auth.controller';
import { authMiddleware } from '@global/helpers/auth-middleware';
import express, { Router } from 'express';

class AuthRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/signup', Auth.prototype.signup);
    this.router.post('/signin', Auth.prototype.signIn);
    this.router.post('/logout', Auth.prototype.logout);
    this.router.post('/forgot-password', Auth.prototype.forgotPassword);
    this.router.post('/reset-password/:token', Auth.prototype.updatePassword);

    this.router.post('/me', authMiddleware.checkAuthentication, Auth.prototype.getMe);

    return this.router;
  }
}

export const authRoutes = new AuthRoutes();
