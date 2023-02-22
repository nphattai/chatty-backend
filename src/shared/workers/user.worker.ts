import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { config } from '@root/config';
import { userService } from '@service/db/user.service';
import { IUserDocument, IUserJob } from '@user/interfaces/user.interface';

const log: Logger = config.createLogger('userWorker');

class UserWorker {
  async addUserToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { value } = job.data as IUserJob;
      await userService.addUserData(value as IUserDocument);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const userWorker: UserWorker = new UserWorker();
