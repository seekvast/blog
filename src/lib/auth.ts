import { getServerSession } from "next-auth/next"
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Username", type: "text", placeholder: "Email or username" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter your email and password");
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            username: credentials.email,
            password: credentials.password,
          }),
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message || "Login failed");
        }

        const data = await res.json();

        if (data.code === 0 && data.data) {
          return {
            id: data.data.hashid,
            name: data.data.nickname,
            email: data.data.email,
            image: data.data.avatar_url,
            accessToken: data.data.token,
            ...data.data,
          };
        }

        throw new Error(data.message || "Invalid credentials");
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
        token.accessToken = user.token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken as string;
        session.user = {
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
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function getSession() {
  return await getServerSession(authOptions);
}

// 创建一个带有认证token的fetch函数
export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const session = await getSession();

  if (!session?.accessToken) {
    throw new Error("No access token found");
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${session.accessToken}`,
  };

  return fetch(url, {
    ...options,
    headers,
  });
}

// 用于检查用户是否已认证的中间件
export async function authMiddleware(request: Request) {
  const session = await getSession();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  return null; // 继续处理请求
}
