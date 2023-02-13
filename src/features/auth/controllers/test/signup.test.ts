import * as cloudinaryUpload from '@global/helpers/cloudinary';
import { CustomError } from '@global/helpers/error-handler';
import { getMockReq, getMockRes } from '@jest-mock/express';
import { authMock, IAuthRequest } from '@root/mocks/auth.mock';
import { authService } from '@service/db/auth.service';
import { UserCache } from '@service/redis/user.cache';
import { AuthController } from '../auth.controller';

jest.mock('@service/queues/base.queue');
jest.mock('@service/queues/auth.queue');
jest.mock('@service/queues/user.queue');
jest.mock('@service/redis/user.cache');
jest.mock('@global/helpers/cloudinary');

describe('Sign up', () => {
  it('should throw an error if username is not available', () => {
    const req = getMockReq<IAuthRequest>({
      body: {
        username: '',
        email: 'test@gmail.com',
        password: '12345678',
        avatarColor: 'blue',
        avatarImage: 'test'
      }
    });

    const { res } = getMockRes({});

    AuthController.prototype.signup(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeError().message).toEqual('Username is a required field');
    });
  });
  it('should throw an error if username is not valid', () => {
    const req = getMockReq<IAuthRequest>({
      body: {
        username: 'te',
        email: 'test@gmail.com',
        password: '12345678',
        avatarColor: 'blue',
        avatarImage: 'test'
      }
    });

    const { res } = getMockRes({});

    AuthController.prototype.signup(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeError().message).toEqual('Invalid username');
    });
  });

  it('should throw an error if password is not available', () => {
    const req = getMockReq<IAuthRequest>({
      body: {
        username: 'test',
        email: 'test@gmail.com',
        password: '',
        avatarColor: 'blue',
        avatarImage: 'test'
      }
    });

    const { res } = getMockRes({});

    AuthController.prototype.signup(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeError().message).toEqual('Password is a required field');
    });
  });
  it('should throw an error if password is not valid', () => {
    const req = getMockReq<IAuthRequest>({
      body: {
        username: 'test',
        email: 'test@gmail.com',
        password: '12',
        avatarColor: 'blue',
        avatarImage: 'test'
      }
    });

    const { res } = getMockRes({});

    AuthController.prototype.signup(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeError().message).toEqual('Invalid password');
    });
  });

  it('should throw an error if email is not available', () => {
    const req = getMockReq<IAuthRequest>({
      body: {
        username: 'test',
        email: '',
        password: '12345678',
        avatarColor: 'blue',
        avatarImage: 'test'
      }
    });

    const { res } = getMockRes({});

    AuthController.prototype.signup(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeError().message).toEqual('Email is a required field');
    });
  });
  it('should throw an error if email is not valid', () => {
    const req = getMockReq<IAuthRequest>({
      body: {
        username: 'test',
        email: 'test@gmail',
        password: '12345678',
        avatarColor: 'blue',
        avatarImage: 'test'
      }
    });

    const { res } = getMockRes({});

    AuthController.prototype.signup(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeError().message).toEqual('Email must be valid');
    });
  });

  it('should throw an error if avatar color is not available', () => {
    const req = getMockReq<IAuthRequest>({
      body: {
        username: 'test',
        email: 'test@gmail.com',
        password: '12345678',
        avatarImage: 'test'
      }
    });

    const { res } = getMockRes({});

    AuthController.prototype.signup(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeError().message).toEqual('Avatar color is required');
    });
  });

  it('should throw an error if avatar image is not available', () => {
    const req = getMockReq<IAuthRequest>({
      body: {
        username: 'test',
        email: 'test@gmail.com',
        password: '12345678',
        avatarColor: 'blue'
      }
    });

    const { res } = getMockRes({});

    AuthController.prototype.signup(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeError().message).toEqual('Avatar image is required');
    });
  });

  it('should throw an error if user is already exist', () => {
    const req = getMockReq<IAuthRequest>({
      body: {
        username: 'test',
        email: 'test@gmail.com',
        password: '12345678',
        avatarColor: 'blue',
        avatarImage: 'test'
      }
    });

    const { res } = getMockRes({});

    jest.spyOn(authService, 'getUserByNameOrEmail').mockResolvedValue(authMock);

    AuthController.prototype.signup(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeError().message).toEqual('Invalid credentials');
    });
  });

  it('should send correct json response', async () => {
    const req = getMockReq({
      body: {
        username: 'test1',
        email: 'test1@gmail.com',
        password: '12345678',
        avatarColor: 'blue',
        avatarImage: 'test'
      }
    });

    const { res } = getMockRes({});

    jest.spyOn(authService, 'getUserByNameOrEmail').mockResolvedValue(null);

    jest.spyOn(cloudinaryUpload, 'upload').mockImplementation(() => Promise.resolve({ version: '12345', public_id: '113131' }));

    jest.spyOn(UserCache.prototype, 'saveUserToCache');

    await AuthController.prototype.signup(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });
});
