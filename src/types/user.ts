import { Category, Response } from "./common";
import { Board } from "./board";

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
  board_count?: number;
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
  discussion_count?: number;
  comment_count?: number;
  posts_count?: number;
  replies_count?: number;
  board_count?: number;
  user_role?: number;
  status?: number;
  restrict_until?: string;
  username_history?: { [key: string]: number }[];
  is_board_moderator?: number;
  age_verified?: number;
  is_online?: boolean;
  is_adult?: boolean;
  categories?: Category[];
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
    blockable_hashid: string;
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
  blockable_hashid: string;
  blocked: User;
}

// 扩展黑名单类型，支持看板和用户
export interface BlacklistItem {
  id: number;
  user_hashid: string;
  blockable_hashid: string;
  blockable_type: "App\\Models\\User" | "App\\Models\\Board";
  blockable: User | Board;
}

export interface UserBlacklistType {
  id: number;
  user_hashid: string;
  blockable_hashid: string;
  blockable_type: "App\\Models\\User" | "App\\Models\\Board";
  blockable: User | Board;
}

export type LoginResponse = Response<User>;
