import { Document } from 'mongoose';

export interface IPost {
  user: string;
  post: string;
  bgColor: string;
  commentCount: number;
  imgVersion?: string;
  imgId?: string;
  videoId?: string;
  videoVersion?: string;
  feelings?: string;
  gifUrl?: string;
  privacy?: string;
  reactions?: IReactions;
  createdAt?: Date;
}

export interface IPostDocument extends IPost, Document {}

export interface IReactions {
  like: number;
  love: number;
  happy: number;
  wow: number;
  sad: number;
  angry: number;
}

export interface IPostJob {
  userId: string;
  createdPost: IPostDocument;
}
