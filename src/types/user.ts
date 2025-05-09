import { Response } from "./common";

export interface UserProfile {
  email: string;
  username: string;
  nickname: string;
  password: string;
  gender?: number;
  birthday?: string;
  avatar_url?: string;
  cover?: string;
  bio?: string;
  blocked?: {
    id: number;
    blocked_id: number;
  };
}
export interface User {
  hashid: string;
  username: string;
  email?: string;
  nickname: string;
  avatar_url?: string;
  cover?: string;
  bio?: string;
  gender?: number;
  birthday?: string;
  is_email_confirmed?: number;
  joined_at?: string;
  last_seen_at?: string;
  token?: string;
  posts_count?: number;
  replies_count?: number;
  user_role?: number;
  status?: number;
  username_history?: string[];
  is_board_moderator?: number;
  age_verified?: number;
  is_online?: boolean;
  preferences?: {
    nsfwVisible: string;
    discloseOnline: string;
    autoFollow: string;
    notify_voted: string;
    notify_reply: string;
    notify_newPost: string;
    notify_userMentioned: string;
    notify_discussionLocked: string;
    notify_report: string;
  };
  blocked?: {
    id: number;
    user_hashid: string;
    blocked_hashid: string;
  };
  age_verification?: {
    id: number;
    user_id: number;
    user_hashid: string;
    status: number;
  };
  created_at?: string;
  updated_at?: string;
}

export interface UserBlacklist {
  id: number;
  user_hashid: string;
  blocked_hashid: string;
  blocked: User;
}

export type LoginResponse = Response<User>;
