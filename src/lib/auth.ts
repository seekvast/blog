import { getSession as getReactSession, signIn } from "next-auth/react";

// Session 缓存机制
let sessionCache: { session: any; timestamp: number } | null = null;
const SESSION_CACHE_DURATION = 1000; // 1秒缓存

/**
 * 获取带缓存的 Session。
 * 在服务器组件中，请直接使用 `import { getServerSession } from "next-auth/next"`。
 */
export async function getSession() {
  const now = Date.now();

  // 如果缓存存在且未过期，直接返回
  if (sessionCache && now - sessionCache.timestamp < SESSION_CACHE_DURATION) {
    return sessionCache.session;
  }

  // 获取新的 session
  const session = await getReactSession();

  // 更新缓存
  sessionCache = {
    session,
    timestamp: now,
  };

  return session;
}

// 清除客户端的 session 缓存
export function clearSessionCache() {
  sessionCache = null;
}

// 带有认证token的fetch函数 (客户端专用)
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
) {
  const session = await getSession();

  if (!session?.user?.token) {
    throw new Error("未找到认证令牌 (Not authenticated)");
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${session.user.token}`,
    "Content-Type": "application/json",
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // 可以根据状态码做更精细的处理，例如 401 时触发登出
    throw new Error(`请求失败: ${response.status} ${response.statusText}`);
  }

  return response;
}

// 防抖标志
let isRefreshing = false;

export async function refreshUserData() {
  if (typeof window === "undefined") {
    console.log("服务端环境，跳过客户端的用户数据刷新");
    return;
  }

  if (isRefreshing) {
    console.log("正在刷新中，请稍后...");
    return;
  }
  isRefreshing = true;

  try {
    const currentSession = await getSession();
    if (!currentSession?.user) {
      console.log("用户未登录，无需刷新数据");
      return;
    }

    // 调用 signIn 来触发 authorize 函数中的刷新逻辑
    await signIn("credentials", {
      redirect: false,
      email: currentSession.user.email,
      password: "dummy-password", // 密码是必须的，但后端逻辑会忽略它
      auth_token: currentSession.user.token,
    });
  } catch (error) {
    console.error("刷新用户数据失败:", error);
  } finally {
    setTimeout(() => {
      isRefreshing = false;
    }, 2000);
  }
}

/*
 * 关于 authMiddleware 的说明：
 *
 * `authMiddleware` 是一个服务器端函数，通常用于 Next.js 的中间件 (`middleware.ts`)。
 * 它不应该放在这个客户端安全的文件中。
 *
 * 应该在根目录下的 `middleware.ts` 文件中实现它，像这样：
 *
 * import { getToken } from "next-auth/jwt";
 * import { NextResponse } from "next/server";
 * import type { NextRequest } from "next/server";
 *
 * export async function middleware(req: NextRequest) {
 * const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
 *
 * // 举例：保护 /dashboard 路径
 * if (req.nextUrl.pathname.startsWith('/dashboard') && !token) {
 * return NextResponse.redirect(new URL('/login', req.url));
 * }
 *
 * return NextResponse.next();
 * }
 *
 * export const config = {
 * matcher: ['/dashboard/:path*'], // 定义需要保护的路径
 * };
 */
