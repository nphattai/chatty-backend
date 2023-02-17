import { ServerError } from '@global/helpers/error-handler';
import { IPost } from '@post/interfaces/post.interface';
import { config } from '@root/config';
import { BaseCache } from '@service/redis/base.cache';
import Logger from 'bunyan';

const log: Logger = config.createLogger('postCache');

export class PostCache extends BaseCache {
  constructor() {
    super('postCache');
  }

  public async savePostToCache(userId: string, uId: string, postId: string, createdPost: IPost): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const { post, bgColor, feelings, privacy, gifUrl, commentCount, imgVersion, imgId, videoId, videoVersion, reactions, createdAt } =
        createdPost;

      const firstList: string[] = [
        '_id',
        `${postId}`,
        'user',
        `${userId}`,
        'post',
        `${post}`,
        'bgColor',
        `${bgColor}`,
        'feelings',
        `${feelings}`,
        'privacy',
        `${privacy}`,
        'gifUrl',
        `${gifUrl}`
      ];

      const secondList: string[] = [
        'commentCount',
        `${commentCount}`,
        'reactions',
        JSON.stringify(reactions),
        'imgVersion',
        `${imgVersion}`,
        'imgId',
        `${imgId}`,
        'videoId',
        `${videoId}`,
        'videoVersion',
        `${videoVersion}`,
        'createdAt',
        `${createdAt}`
      ];

      const dataToSave = [...firstList, ...secondList];

      const postCount: string[] = await this.client.HMGET(`users:${userId}`, 'postCount');

      const multi = this.client.multi();

      multi.ZADD('post', { score: parseInt(uId), value: `${postId}` });
      multi.HSET(`posts:${postId}`, dataToSave);
      multi.HSET(`users:${userId}`, ['postCount', parseInt(postCount[0]) + 1]);

      await multi.exec();
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }
}

export const postCache = new PostCache();
