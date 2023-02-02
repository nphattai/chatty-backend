import { BadRequestError, CustomError } from '@global/helpers/error-handler';
import { config } from '@root/config';
import { userService } from '@service/db/user.service';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

const log = config.createLogger('USER');

export class UserController {
  public async getMe(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.currentUser!;

      const userInfo = await userService.getUserById(userId);

      // Response to client
      res.status(HTTP_STATUS.OK).json({
        user: userInfo
      });
    } catch (error) {
      log.error(error);
      if (error instanceof CustomError) {
        throw error;
      } else {
        throw new BadRequestError('Server error');
      }
    }
  }
}
