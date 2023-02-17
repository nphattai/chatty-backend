import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { IPostDocument } from '@post/interfaces/post.interface';
import { postSchema } from '@post/schemes/post.scheme';
import { postQueue } from '@service/queues/post.queue';
import { postCache } from '@service/redis/post.cache';
import { socketIOPostObject } from '@socket/post.socket';
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

    socketIOPostObject.emit('create-post', createdPost);

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
}
