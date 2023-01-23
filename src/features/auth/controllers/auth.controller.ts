import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { emailSchema, passwordSchema } from '@auth/schemas/password.schema';
import { signInSchema } from '@auth/schemas/signin.schema';
import { signupSchema } from '@auth/schemas/signup.schema';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { upload } from '@global/helpers/cloudinary';
import { BadRequestError, CustomError } from '@global/helpers/error-handler';
import { Helpers } from '@global/helpers/helpers';
import { config } from '@root/config';
import { authService } from '@service/db/auth.service';
import { userService } from '@service/db/user.service';
import { forgotPasswordTemplate } from '@service/emails/templates/forgot-password/forgot-password-template';
import { resetPasswordTemplate } from '@service/emails/templates/reset-password/reset-password-template';
import { authQueue } from '@service/queues/auth.queue';
import { emailQueue } from '@service/queues/email.queue';
import { userQueue } from '@service/queues/user.queue';
import { UserCache } from '@service/redis/user.cache';
import { IResetPasswordParams, IUserDocument } from '@user/interfaces/user.interface';
import crypto from 'crypto';
import dayjs from 'dayjs';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import publicIp from 'ip';
import JWT from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

const userCache: UserCache = new UserCache();
const log = config.createLogger('AUTH');

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

  @joiValidation(signInSchema)
  public async signIn(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      // Check user exist
      const existingUser = await authService.getUserByName(username);

      if (!existingUser) {
        throw new BadRequestError('Invalid credentials');
      }

      const matchPassword = await existingUser.comparePassword(password);

      if (!matchPassword) {
        throw new BadRequestError('Incorrect password');
      }

      const userInfo = await userService.getUserByAuthId(existingUser.id);

      // Sign token
      const userJwt = Auth.prototype.signToken(existingUser, userInfo!._id);

      req.session = { jwt: userJwt };

      // Response to client
      res.status(HTTP_STATUS.OK).json({
        message: 'login successfully',
        user: userInfo,
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

  public async logout(req: Request, res: Response): Promise<void> {
    try {
      req.session = null;

      // Response to client
      res.status(HTTP_STATUS.OK).json({
        message: 'Logout successfully',
        user: {}
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

  @joiValidation(emailSchema)
  public async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      const existingUser = await authService.getUserByEmail(email);
      if (!existingUser) {
        throw new BadRequestError('Invalid credentials');
      }

      const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
      const randomCharacters: string = randomBytes.toString('hex');
      const timeExpiration = Date.now() * 60 * 60 * 1000;

      // Update password expiration
      authService.updatePasswordToken(existingUser._id?.toString(), randomCharacters, timeExpiration);

      // Send forgot password email
      const resetLink = `${config.CLIENT_URL}/forgot-password?token=${randomCharacters}`;
      const template = forgotPasswordTemplate.passwordResetTemplate(existingUser?.username, resetLink);
      emailQueue.addEmailJob('forgotPasswordEmail', {
        template,
        receiverEmail: existingUser.email,
        subject: 'Reset your password'
      });

      res.status(HTTP_STATUS.OK).json({ message: 'Password reset email sent.' });
    } catch (error) {
      log.error(error);
      if (error instanceof CustomError) {
        throw error;
      } else {
        throw new BadRequestError('Server error');
      }
    }
  }

  @joiValidation(passwordSchema)
  public async updatePassword(req: Request, res: Response): Promise<void> {
    try {
      const { password, confirmPassword } = req.body;
      const { token } = req.params;

      if (password !== confirmPassword) {
        throw new BadRequestError('Passwords do not match');
      }

      const existingUser = await authService.getUserByPasswordResetToken(token);
      if (!existingUser) {
        throw new BadRequestError('Reset token has expired.');
      }

      // Update new information
      existingUser.passwordResetToken = undefined;
      existingUser.passwordResetExpires = undefined;
      existingUser.password = password;
      await existingUser.save();

      // Send reset password confirmation email
      const templateParams: IResetPasswordParams = {
        username: existingUser.username,
        email: existingUser.email,
        ipaddress: publicIp.address(),
        date: dayjs().format('DD/MM/YYYY HH:mm')
      };
      const template = resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams);
      emailQueue.addEmailJob('forgotPasswordEmail', {
        template,
        receiverEmail: existingUser.email,
        subject: 'Password Reset Confirmation'
      });

      res.status(HTTP_STATUS.OK).json({ message: 'Password successfully updated.' });
    } catch (error) {
      log.error(error);
      if (error instanceof CustomError) {
        throw error;
      } else {
        throw new BadRequestError('Server error');
      }
    }
  }

  private signToken(data: IAuthDocument, userObjectId: ObjectId | string): string {
    return JWT.sign(
      {
        userId: userObjectId,
        uId: data.uId,
        email: data.email,
        username: data.username,
        avatarColor: data.avatarColor
      },
      config.JWT_TOKEN!,
      { expiresIn: '24h' }
    );
  }
}

export const auth = new Auth();
