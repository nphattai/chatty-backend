import { IPostJob } from '@post/interfaces/post.interface';
import { BaseQueue } from '@service/queues/base.queue';
import { postWorker } from '@worker/post.worker';

class PostQueue extends BaseQueue {
  constructor() {
    super('post');
    this.processJob('addPostToDB', 5, postWorker.addPostToDB);
    this.processJob('deletePostById', 5, postWorker.deletePostById);
    this.processJob('updatePostById', 5, postWorker.updatePostById);
  }

  public addPostJob(name: string, data: IPostJob): void {
    this.addJob(name, data);
  }
}

export const postQueue = new PostQueue();
