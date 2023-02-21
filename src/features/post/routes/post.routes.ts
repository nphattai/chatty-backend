import { authMiddleware } from '@global/helpers/auth-middleware';
import { PostController } from '@post/controllers/post.controller';
import express, { Router } from 'express';

class PostRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/create-post', authMiddleware.checkAuthentication, PostController.prototype.createPost);
    this.router.get('/get-all-post', authMiddleware.checkAuthentication, PostController.prototype.getPosts);

    return this.router;
  }
}

export const postRoutes = new PostRoutes();
