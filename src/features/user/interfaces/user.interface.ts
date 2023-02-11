import mongoose, { Document } from 'mongoose';
import { IAuth } from '@auth/interfaces/auth.interface';

export interface IUser {
  auth: string | mongoose.Types.ObjectId;
  postsCount: number;
  work: string;
  school: string;
  quote: string;
  location: string;
  blocked: mongoose.Types.ObjectId[];
  blockedBy: mongoose.Types.ObjectId[];
  followersCount: number;
  followingCount: number;
  notifications: INotificationSettings;
  social: ISocialLinks;
  bgImageVersion: string;
  bgImageId: string;
  profilePicture: string;
}

export interface IUserDocument extends IUser, Document {}

export interface PopulatedUser {
  auth: IAuth;
}

export interface INotificationSettings {
  messages: boolean;
  reactions: boolean;
  comments: boolean;
  follows: boolean;
}

export interface ISocialLinks {
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
}

export interface IResetPasswordParams {
  username: string;
  email: string;
  ipaddress: string;
  date: string;
}

export interface IUserJob {
  keyOne?: string;
  keyTwo?: string;
  key?: string;
  value?: string | INotificationSettings | IUserDocument;
}

export interface IEmailJob {
  receiverEmail: string;
  template: string;
  subject: string;
}
