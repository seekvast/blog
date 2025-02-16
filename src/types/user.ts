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
}
export interface User {
  hashid: string;
  username: string;
  email: string;
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
  created_at?: string;
  updated_at?: string;
}

export type LoginResponse = Response<User>;
