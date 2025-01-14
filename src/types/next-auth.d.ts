import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: User;
  }

  interface User {
    id: string;
    username: string;
    email: string;
    image?: string;
    accessToken?: string;
    token?: string;
    nickname?: string;
    avatar_url?: string;
    cover?: string;
    bio?: string;
    gender?: number;
    birthday?: string;
    is_email_confirmed?: number;
    joined_at?: string;
    last_seen_at?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    accessToken?: string;
    token?: string;
    nickname?: string;
    avatar_url?: string;
    cover?: string;
    bio?: string;
    gender?: number;
    birthday?: string;
    is_email_confirmed?: number;
    joined_at?: string;
    last_seen_at?: string;
  }
}
