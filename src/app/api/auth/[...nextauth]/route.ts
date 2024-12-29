import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // 调用 Laravel API 进行认证
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/login`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: credentials?.email,
                password: credentials?.password,
              }),
            }
          );
          console.log(response, "..................pppppppppppppp");
          if (!response.ok) {
            return null;
          }

          const user = await response.json();
          return user.data;
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    // 将 token 添加到 JWT 中
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.token;
      }
      return { ...token, ...user };
    },
    // 将 token 添加到会话中
    async session({ session, token }: { session: any; token: any }) {
      session.accessToken = token.accessToken;
      session.user = token;
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});

export { handler as GET, handler as POST };
