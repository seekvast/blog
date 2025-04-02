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
    async jwt({ token, user }) {
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
      return token;
    },
    async session({ session, token }) {
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
          preferences: token.preferences,
          token: token.token as string,
        };
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

//适用API请求调用
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

  return null; // 继续处理请求
}
