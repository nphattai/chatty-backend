import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { config } from '@root/config';
import { postService } from '@service/db/post.service';
import { IPostJob } from '@post/interfaces/post.interface';

const log: Logger = config.createLogger('postWorker');

class PostWorker {
  async addPostToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { userId, createdPost } = job.data as IPostJob;
      await postService.createPost(userId, createdPost);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const postWorker: PostWorker = new PostWorker();
