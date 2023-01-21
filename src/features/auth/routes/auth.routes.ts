import { Auth } from '@auth/controllers/auth.controller';
import express, { Router } from 'express';

class AuthRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/signup', Auth.prototype.signup);

    return this.router;
  }
}

export const authRoutes = new AuthRoutes();
