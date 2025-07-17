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
        turnstile_token: { label: "Turnstile Token", type: "text" },
        auth_token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter your email and password");
        }
        let data: ApiUser;
        if (credentials.auth_token) {
          data = await api.users.refreshToken();
        } else {
          data = await api.users.login({
            email: credentials.email,
            password: credentials.password,
            turnstile_token: credentials.turnstile_token ?? "",
            auth_token: credentials.auth_token ?? "",
          });
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
        token.is_board_moderator = user.is_board_moderator;
        token.age_verified = user.age_verified;
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
        token.token = refreshUser.token;
        token.is_board_moderator = refreshUser.is_board_moderator;
        token.age_verified = refreshUser.age_verified;
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
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
};

// Session 缓存机制
let sessionCache: { session: any; timestamp: number } | null = null;
const SESSION_CACHE_DURATION = 1000; // 1秒缓存

export async function getSession() {
  if (typeof window === "undefined") {
    return await getServerSession(authOptions);
  } else {
    // 客户端环境，使用缓存机制
    const now = Date.now();

    // 如果缓存存在且未过期，直接返回
    if (sessionCache && now - sessionCache.timestamp < SESSION_CACHE_DURATION) {
      return sessionCache.session;
    }

    // 获取新的 session
    const { getSession } = await import("next-auth/react");
    const session = await getSession();

    // 更新缓存
    sessionCache = {
      session,
      timestamp: now,
    };

    return session;
  }
}

// 清除 session 缓存
export function clearSessionCache() {
  sessionCache = null;
}

// 带有认证token的fetch函数
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

// 防抖标志
let isRefreshing = false;
let refreshTimeout: NodeJS.Timeout | null = null;

// 刷新用户数据
export async function refreshUserData() {
  try {
    if (typeof window === "undefined") {
      console.log("服务端环境，跳过刷新用户数据");
      return;
    }

    if (isRefreshing) {
      return;
    }

    isRefreshing = true;
    if (refreshTimeout) {
      clearTimeout(refreshTimeout);
    }

    refreshTimeout = setTimeout(() => {
      isRefreshing = false;
      refreshTimeout = null;
    }, 5000);

    const { signIn } = await import("next-auth/react");

    const currentSession = await getSession();
    if (!currentSession?.user) {
      console.log("用户未登录，无需刷新数据");
      isRefreshing = false;
      return;
    }
    try {
      await signIn("credentials", {
        redirect: false,
        email: currentSession.user.email,
        password: "dummy-password",
        auth_token: currentSession.user.token,
      });
    } catch (signInError) {
      throw signInError;
    } finally {
      isRefreshing = false;
    }
  } catch (error) {
    isRefreshing = false;
    throw error;
  }
}
