import { getServerSession } from "next-auth/next";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { api } from "./api";
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
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter your email and password");
        }

        const data = await api.users.login({
          email: credentials.email,
          password: credentials.password,
        });
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
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, trigger, user, session }) {
      if (user) {
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
      }
      if (trigger === "update" && session?.user) {
        const refreshUser = await api.users.refreshToken();
        token.hashid = refreshUser.hashid;
        token.username = refreshUser.username;
        token.email = refreshUser.email;
        token.nickname = refreshUser.nickname;
        token.avatar_url = refreshUser.avatar_url;
        token.cover = refreshUser.cover;
        token.bio = refreshUser.bio;
        token.gender = refreshUser.gender;
        token.birthday = refreshUser.birthday;
        token.is_email_confirmed = refreshUser.is_email_confirmed;
        token.joined_at = refreshUser.joined_at;
        token.last_seen_at = refreshUser.last_seen_at;
        token.preferences = refreshUser.preferences;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.hashid as string,
          hashid: token.hashid as string,
          username: token.username as string,
          nickname: token.nickname as string,
          ...token,
        };
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: true,
  secret: process.env.NEXTAUTH_SECRET,
};

export async function getSession() {
  if (typeof window === "undefined") {
    return await getServerSession(authOptions);
  } else {
    const { getSession } = await import("next-auth/react");
    return await getSession();
  }
}

// 创建一个带有认证token的fetch函数
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
) {
  const session = await getSession();

  if (!session?.user?.token) {
    throw new Error("未找到认证令牌");
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${session.user.token}`,
    "Content-Type": "application/json",
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`请求失败: ${response.status} ${response.statusText}`);
    }

    return response;
  } catch (error) {
    console.error("请求错误:", error);
    throw error;
  }
}

// 用于检查用户是否已认证的中间件
export async function authMiddleware(request: Request) {
  const session = await getSession();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  return null;
}
