// src/lib/auth-options.ts
// ⚠️ [服务器专用] - 此文件包含服务器端逻辑，请勿在任何客户端组件中导入。

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { headers } from "next/headers"; // 在这里导入是安全的
import { api } from "@/lib/api";
import { User as ApiUser } from "@/types/user";

type NextAuthUser = ApiUser & {
  id: string;
};

declare module "next-auth" {
  interface User extends NextAuthUser {}
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Username",
          type: "text",
          placeholder: "Email or username",
        },
        password: { label: "Password", type: "password" },
        turnstile_token: { label: "Turnstile Token", type: "text" },
        auth_token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        // 在 authorize 函数内部安全地获取 IP 地址
        const ip =
          headers().get("x-forwarded-for")?.split(",")[0].trim() ||
          headers().get("x-real-ip") ||
          "127.0.0.1";
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter your email and password");
        }
        let data: ApiUser;
        if (credentials.auth_token) {
          // 刷新 token 时也可以传递 IP 用于审计
          data = await api.users.refreshToken();
        } else {
          // 登录时将 IP 传递给后端 API
          data = await api.users.login({
            email: credentials.email,
            password: credentials.password,
            turnstile_token: credentials.turnstile_token ?? "",
            auth_token: credentials.auth_token ?? "",
            ip_address: ip,
          });
        }

        // 确保你的 API 返回了有效数据
        if (!data || !data.hashid) {
          return null;
        }

        return {
          id: data.hashid,
          hashid: data.hashid,
          username: data.username,
          email: data.email,
          nickname: data.nickname,
          avatar_url: data.avatar_url,
          cover: data.cover,
          bio: data.bio,
          gender: data.gender,
          birthday: data.birthday,
          is_email_confirmed: data.is_email_confirmed,
          joined_at: data.joined_at,
          last_seen_at: data.last_seen_at,
          token: data.token,
          preferences: data.preferences,
          is_board_moderator: data.is_board_moderator,
          age_verified: data.age_verified,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, trigger, user, session }) {
      // 首次登录时，将用户信息填充到 token
      if (user) {
        token.id = user.id;
        token.hashid = user.hashid;
        token.username = user.username;
        token.email = user.email;
        token.nickname = user.nickname;
        token.avatar_url = user.avatar_url;
        token.cover = user.cover;
        token.bio = user.bio;
        token.gender = user.gender;
        token.birthday = user.birthday;
        token.is_email_confirmed = user.is_email_confirmed;
        token.joined_at = user.joined_at;
        token.last_seen_at = user.last_seen_at;
        token.preferences = user.preferences;
        token.token = user.token;
        token.is_board_moderator = user.is_board_moderator;
        token.age_verified = user.age_verified;
      }

      // 当 session 被更新时（例如调用 useSession().update()）
      if (trigger === "update" && session?.user) {
        const refreshUser = await api.users.refreshToken();
        // ... 更新 token 的逻辑 ...
        token.nickname = refreshUser.nickname;
      }
      return token;
    },
    async session({ session, token }) {
      // 将 token 中的数据同步到 session.user 对象
      if (token) {
        session.user = {
          id: token.hashid as string,
          hashid: token.hashid as string,
          username: token.username as string,
          email: token.email as string,
          nickname: token.nickname as string,
          avatar_url: token.avatar_url as string,
          cover: token.cover as string,
          bio: token.bio as string,
          gender: token.gender as number,
          birthday: token.birthday as string,
          is_email_confirmed: token.is_email_confirmed as number,
          joined_at: token.joined_at as string,
          last_seen_at: token.last_seen_at as string,
          token: token.token as string,
          preferences: token.preferences as any,
          is_board_moderator: token.is_board_moderator as number,
          age_verified: token.age_verified as number,
          ...token, // 展开其他属性
        };
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
};
