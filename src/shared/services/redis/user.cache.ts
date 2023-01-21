import { ServerError } from '@global/helpers/error-handler';
import { config } from '@root/config';
import { BaseCache } from '@service/redis/base.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import Logger from 'bunyan';

const log: Logger = config.createLogger('userCache');

export class UserCache extends BaseCache {
  constructor() {
    super('userCache');
  }

  public async saveUserToCache(userId: string, createdUser: IUserDocument): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.set(`users:${userId}`, JSON.stringify(createdUser));
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }
}
