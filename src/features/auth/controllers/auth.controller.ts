import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { signupSchema } from '@auth/schemas/signup.schema';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { upload } from '@global/helpers/cloudinary';
import { BadRequestError, CustomError } from '@global/helpers/error-handler';
import { Helpers } from '@global/helpers/helpers';
import { config } from '@root/config';
import { authService } from '@service/db/auth.service';
import { authQueue } from '@service/queues/auth.queue';
import { userQueue } from '@service/queues/user.queue';
import { UserCache } from '@service/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import JWT from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

const userCache: UserCache = new UserCache();
const log = config.createLogger('SIGN UP');

export class Auth {
  @joiValidation(signupSchema)
  public async signup(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password, avatarColor, avatarImage } = req.body;

      // Check user exist
      const userExist = await authService.getUserByNameOrEmail(username, email);

      if (userExist) {
        throw new BadRequestError('Invalid credentials');
      }

      // Generate auth data
      const authObjectId = new ObjectId();
      const userObjectId = new ObjectId();
      const uId = Helpers.generateRandomIntegers(12)?.toString();

      // Generate user data
      const authData: IAuthDocument = {
        _id: authObjectId,
        uId,
        username,
        email,
        password,
        avatarColor,
        createdAt: new Date()
      } as IAuthDocument;

      // Upload avatar to Cloudinary
      const uploadAvatarRes = await upload(avatarImage, userObjectId?.toString(), true, true);
      if (!uploadAvatarRes?.public_id) {
        throw new BadRequestError('File upload: Error occurred. Try again.');
      }

      // Cache user data
      const userDataToCache: IUserDocument = {
        ...authData,
        _id: userObjectId,
        authId: authData?._id,
        profilePicture: `https://res.cloudinary.com/dyamr9ym3/image/upload/v${uploadAvatarRes?.version}/${userObjectId}`,
        blocked: [],
        blockedBy: [],
        work: '',
        location: '',
        school: '',
        quote: '',
        bgImageVersion: '',
        bgImageId: '',
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        notifications: {
          messages: true,
          reactions: true,
          comments: true,
          follows: true
        },
        social: {
          facebook: '',
          instagram: '',
          twitter: '',
          youtube: ''
        }
      } as unknown as IUserDocument;

      await userCache.saveUserToCache(userObjectId?.toString(), userDataToCache);

      // Save auth data to DB
      authQueue.addAuthUserJob('addAuthUserToDB', { value: authData });

      // Save user data to DB
      userQueue.addUserJob('addUserToDB', { value: userDataToCache });

      // Sign token
      const userJwt = Auth.prototype.signToken(authData, userObjectId);

      req.session = { jwt: userJwt };

      // Response to client
      res.status(HTTP_STATUS.CREATED).json({
        message: 'User created successfully',
        user: userDataToCache,
        token: userJwt
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

  private signToken(data: IAuthDocument, userObjectId: ObjectId): string {
    return JWT.sign(
      {
        userId: userObjectId,
        uId: data.uId,
        email: data.email,
        username: data.username,
        avatarColor: data.avatarColor
      },
      config.JWT_TOKEN!
    );
  }
}

export const auth = new Auth();
