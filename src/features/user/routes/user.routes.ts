import { authMiddleware } from '@global/helpers/auth-middleware';
import { UserController } from '@user/controllers/user.controller';
import express, { Router } from 'express';

class UserRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/me', authMiddleware.checkAuthentication, UserController.prototype.getMe);

    return this.router;
  }
}

export const userRoutes = new UserRoutes();
