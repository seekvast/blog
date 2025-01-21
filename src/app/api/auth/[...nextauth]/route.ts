import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// 在 App Router 中，不需要手动处理 query 参数
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }
