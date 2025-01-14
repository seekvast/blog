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
          const apiUrl = process.env.NEXT_PUBLIC_API_URL;
          console.log('API URL:', apiUrl); // 调试日志
          
          // 调用 Laravel API 进行认证
          const response = await fetch(
            `${apiUrl}/api/login`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
              },
              body: JSON.stringify({
                email: credentials?.email,
                password: credentials?.password,
              }),
            }
          );
          
          console.log('Auth Response Status:', response.status); // 调试日志
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Auth Error:', errorData); // 调试日志
            return null;
          }

          const user = await response.json();
          console.log('Auth Success:', user); // 调试日志
          return user.data;
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.token;
      }
      return { ...token, ...user };
    },
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
  debug: true, // 开启调试模式
});

export { handler as GET, handler as POST };
