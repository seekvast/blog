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
  blocked?: {
    id: number;
    user_hashid: string;
    blocked_hashid: string;
  };
  created_at?: string;
  updated_at?: string;
}

export type LoginResponse = Response<User>;
