// import { getServerSession } from "next-auth/next"
// import { NextAuthOptions } from "next-auth"
// import CredentialsProvider from "next-auth/providers/credentials"

// export const authOptions: NextAuthOptions = {
//   providers: [
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Username", type: "text", placeholder: "Email or username" },
//         password: { label: "Password", type: "password" }
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) {
//           throw new Error("Please enter your email and password");
//         }

//         const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, {
//           method: "POST",
//           headers: { 
//             "Content-Type": "application/json",
//             "Accept": "application/json"
//           },
//           body: JSON.stringify({
//             username: credentials.email,
//             password: credentials.password,
//           }),
//         });

//         if (!res.ok) {
//           const error = await res.json();
//           throw new Error(error.message || "Login failed");
//         }

//         const data = await res.json();

//         if (data.code === 0 && data.data) {
//           return {
//             id: data.data.hashid,
//             name: data.data.nickname,
//             email: data.data.email,
//             image: data.data.avatar_url,
//             accessToken: data.data.token,
//             ...data.data,
//           };
//         }

//         throw new Error(data.message || "Invalid credentials");
//       },
//     }),
//   ],
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id;
//         token.accessToken = user.accessToken;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       if (token) {
//         session.user.id = token.id;
//         session.accessToken = token.accessToken;
//       }
//       return session;
//     },
//   },
//   pages: {
//     signIn: "/login",
//   },
//   session: {
//     strategy: "jwt",
//   },
//   secret: process.env.NEXTAUTH_SECRET,
// };

// export async function getSession() {
//   return await getServerSession(authOptions);
// }

// // 创建一个带有认证token的fetch函数
// export async function authenticatedFetch(url: string, options: RequestInit = {}) {
//   const session = await getSession();

//   if (!session?.accessToken) {
//     throw new Error("No access token found");
//   }

//   const headers = {
//     ...options.headers,
//     Authorization: `Bearer ${session.accessToken}`,
//   };

//   return fetch(url, {
//     ...options,
//     headers,
//   });
// }

// // 用于检查用户是否已认证的中间件
// export async function authMiddleware(request: Request) {
//   const session = await getSession();

//   if (!session) {
//     return new Response("Unauthorized", { status: 401 });
//   }

//   return null; // 继续处理请求
// }
