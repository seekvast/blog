import { Response } from "./common";

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
}

export type LoginResponse = Response<User>;
