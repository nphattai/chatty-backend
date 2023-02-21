import { IPostDocument } from '@post/interfaces/post.interface';
import { PostModel } from '@post/models/post.schema';
import { UserModel } from '@user/models/user.schema';

class PostService {
  public async createPost(userId: string, data: IPostDocument): Promise<void> {
    const post = PostModel.create(data);
    const user = UserModel.updateOne({ _id: userId }, { $inc: { postCount: 1 } });
    await Promise.all([post, user]);
  }

  public async getPost(skip: number, limit: number): Promise<IPostDocument> {
    const result = (await await PostModel.find({}).sort({ _id: -1 }).skip(skip).limit(limit)) as unknown as IPostDocument;
    return result;
  }
}

export const postService = new PostService();
