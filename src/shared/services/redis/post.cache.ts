import { ServerError } from '@global/helpers/error-handler';
import { IPost } from '@post/interfaces/post.interface';
import { config } from '@root/config';
import { BaseCache } from '@service/redis/base.cache';
import Logger from 'bunyan';
import { userCache } from './user.cache';

const log: Logger = config.createLogger('postCache');

export class PostCache extends BaseCache {
  constructor() {
    super('postCache');
  }

  /**
   * Need to fix some issues:
   * - user info not exist in cache, miss match between DB and cache
   * - perf: get all info in user cache, override later => should pick and update only necessary field: refactor set => HSET
   */
  public async savePostToCache(userId: string, postId: string, createdPost: IPost): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const userCached = await userCache.getUserFromCache(userId);

      const multi = this.client.multi();

      const postCount = (userCached?.postCount || 0) + 1;

      multi.set(`posts:${postId}`, JSON.stringify({ ...createdPost, _id: postId }));
      multi.set(`users:${userId}`, JSON.stringify({ ...userCached, postCount }));

      await multi.exec();
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }
}

export const postCache = new PostCache();
