import { IPostDocument } from '@post/interfaces/post.interface';
import { PostModel } from '@post/models/post.schema';
import { UserModel } from '@user/models/user.schema';

class PostService {
  public async createPost(userId: string, data: IPostDocument): Promise<void> {
    const post = PostModel.create(data);
    const user = UserModel.updateOne({ _id: userId }, { $inc: { postCount: 1 } });
    await Promise.all([post, user]);
  }
}

export const postService = new PostService();
