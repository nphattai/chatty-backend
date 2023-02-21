import { BadRequestError } from '@global/helpers/error-handler';
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

  public async deletePostById(postId: string): Promise<void> {
    const post = await PostModel.findOne({ _id: postId });

    if (!post) {
      throw new BadRequestError(`Can not find post ${postId}`);
    }

    await PostModel.deleteOne({ _id: postId });
    await UserModel.updateOne({ _id: post?.user }, { $inc: { postCount: -1 } });
  }
}

export const postService = new PostService();
