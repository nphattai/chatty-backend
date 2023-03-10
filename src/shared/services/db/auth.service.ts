import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { AuthModel } from '@auth/models/auth.schema';

class AuthService {
  public async createAuthUser(data: IAuthDocument): Promise<void> {
    await AuthModel.create(data);
  }

  public async getUserByNameOrEmail(username: string, email: string): Promise<IAuthDocument | null> {
    const user = await AuthModel.findOne({
      $or: [
        {
          username,
          email
        }
      ]
    }).exec();

    return user;
  }

  public async getUserByName(username: string): Promise<IAuthDocument | null> {
    const user = await AuthModel.findOne({
      username
    }).exec();

    return user;
  }

  public async getUserByEmail(email: string): Promise<IAuthDocument | null> {
    const user = await AuthModel.findOne({
      email
    }).exec();

    return user;
  }

  public async updatePasswordToken(authId: string, passwordResetToken: string, passwordResetExpires: number): Promise<void> {
    await AuthModel.updateOne({ _id: authId }, { passwordResetToken, passwordResetExpires });
  }

  public async getUserByPasswordResetToken(passwordResetToken: string): Promise<IAuthDocument | null> {
    const user = await AuthModel.findOne({
      passwordResetToken
    }).exec();

    return user;
  }
}

export const authService = new AuthService();
