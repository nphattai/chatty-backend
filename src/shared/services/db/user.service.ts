import { IAuth } from '@auth/interfaces/auth.interface';
import { IUserDocument, PopulatedUser } from '@user/interfaces/user.interface';
import { UserModel } from '@user/models/user.schema';

class UserService {
  public async addUserData(data: IUserDocument): Promise<void> {
    await UserModel.create(data);
  }

  public async getUserByAuthId(authId: string): Promise<(Omit<IUserDocument, 'auth'> & { auth: IAuth }) | null> {
    const user = await UserModel.findOne({ auth: authId }).populate<Pick<PopulatedUser, 'auth'>>({ path: 'auth' });
    return user;
  }

  public async getUserById(id: string): Promise<(Omit<IUserDocument, 'auth'> & { auth: IAuth }) | null> {
    const user = await UserModel.findOne({ _id: id }).populate<Pick<PopulatedUser, 'auth'>>({ path: 'auth' });

    return user;
  }
}

export const userService = new UserService();
