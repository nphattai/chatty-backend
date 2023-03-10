import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { config } from '@root/config';
import { postService } from '@service/db/post.service';
import { ICreatePostJob, IDeletePostJob, IUpdatePostJob } from '@post/interfaces/post.interface';

const log: Logger = config.createLogger('postWorker');

class PostWorker {
  async addPostToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { userId, createdPost } = job.data as ICreatePostJob;
      await postService.createPost(userId, createdPost);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  async deletePostById(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { userId, postId } = job.data as IDeletePostJob;
      await postService.deletePostById(postId, userId);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  async updatePostById(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { userId, postId, payload } = job.data as IUpdatePostJob;
      await postService.updatePostById(postId, userId, payload);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const postWorker: PostWorker = new PostWorker();
