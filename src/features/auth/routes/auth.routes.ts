import { AuthController } from '@auth/controllers/auth.controller';
import express, { Router } from 'express';

class AuthRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/signup', AuthController.prototype.signup);
    this.router.post('/signin', AuthController.prototype.signIn);
    this.router.post('/forgot-password', AuthController.prototype.forgotPassword);
    this.router.post('/reset-password/:token', AuthController.prototype.updatePassword);

    return this.router;
  }
}

export const authRoutes = new AuthRoutes();
