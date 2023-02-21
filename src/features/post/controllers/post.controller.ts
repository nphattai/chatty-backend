import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { BadRequestError, CustomError } from '@global/helpers/error-handler';
import { IPostDocument } from '@post/interfaces/post.interface';
import { postSchema } from '@post/schemes/post.scheme';
import { postService } from '@service/db/post.service';
import { postQueue } from '@service/queues/post.queue';
import { postCache } from '@service/redis/post.cache';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { Types } from 'mongoose';

export class PostController {
  @joiValidation(postSchema)
  public async createPost(req: Request, res: Response) {
    const { post, bgColor, privacy, gifUrl, feelings } = req.body;

    const postObjectId = new Types.ObjectId();

    const { userId = '', uId = '' } = req.currentUser || {};

    const createdPost = {
      _id: postObjectId,
      user: userId,
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      commentCount: 0,
      imgVersion: '',
      imgId: '',
      videoId: '',
      videoVersion: '',
      createdAt: new Date(),
      reactions: { like: 0, love: 0, happy: 0, sad: 0, wow: 0, angry: 0 }
    } as IPostDocument;

    // Todo: fix not working
    // socketIOPostObject.emit('create-post', createdPost);

    await postCache.savePostToCache(userId, uId, postObjectId.toString(), createdPost);

    postQueue.addPostJob('addPostToDB', {
      userId,
      createdPost: createdPost
    });

    res.status(HTTP_STATUS.CREATED).json({
      message: 'Post created successfully',
      post: createdPost
    });
  }

  public async getPosts(req: Request, res: Response) {
    try {
      const { page, limit } = req.query as { page: string; limit: string };

      if (!page || !limit) {
        throw new BadRequestError('Page and limit should not be empty');
      }

      const start = (parseInt(page) - 1) * parseInt(limit);

      const end = parseInt(page) * parseInt(limit);

      let result = {};
      // Get posts from cache
      const postFromCache = await postCache.getPostsFromCache(start, end);

      if (postFromCache) {
        result = postFromCache;
      } else {
        // Get post from DB
        result = await postService.getPost(start, end);
      }

      res.status(HTTP_STATUS.OK).json({ message: 'Get post successfully', posts: result });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      } else {
        throw new BadRequestError('Server error');
      }
    }
  }

  public async deletePostById(req: Request, res: Response) {
    try {
      const { id } = req.query as { id: string };

      if (!id) {
        throw new BadRequestError('Post id should not be empty');
      }

      const { userId = '' } = req.currentUser || {};

      await Promise.all([postCache.deletePostById(id, userId), postService.deletePostById(id, userId)]);

      res.status(HTTP_STATUS.OK).json({ message: `Delete post ${id} successfully` });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      } else {
        throw new BadRequestError('Server error');
      }
    }
  }
}
