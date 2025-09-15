import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import acceptLanguage from "accept-language";
import { fallbackLng, languages, cookieName } from "./i18n/settings";

acceptLanguage.languages(languages);

// 需要登录的路由
const authRoutes = [];

const isProtectedPath = (path: string) => {
  if (/^\/u\/[^/]+\/settings/.test(path)) {
    return true;
  }
  return false;
};

const guestRoutes = ["/login", "/register", "/forgot-password"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let lng = request.nextUrl.searchParams.get("lang");

  if (!lng && request.cookies.has(cookieName)) {
    lng = acceptLanguage.get(request.cookies.get(cookieName)!.value);
  }
  if (!lng) {
    lng = acceptLanguage.get(request.headers.get("Accept-Language"));
  }
  if (!lng) {
    lng = fallbackLng;
  }

  // 检查路径是否已经包含语言前缀
  const pathnameHasLocale = languages.some(
    (loc) => pathname.startsWith(`/${loc}/`) || pathname === `/${loc}`
  );

  if (pathnameHasLocale) {
    // 这里的逻辑可以保持，处理已经有语言前缀的 URL
    return NextResponse.next();
  }

  // 重定向到带语言前缀的 URL
  if (!pathname.startsWith("/_next") && !pathname.startsWith("/api")) {
    const redirectUrl = new URL(`/${lng}${pathname}`, request.url);

    request.nextUrl.searchParams.forEach((value, key) => {
      redirectUrl.searchParams.set(key, value);
    });

    const response = NextResponse.redirect(redirectUrl);
    if (request.nextUrl.searchParams.has("lang")) {
      response.cookies.set(cookieName, lng);
    }
    return response;
  }

  const sessionToken =
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value;
  const isAuthenticated = !!sessionToken;

  // 处理需要登录的路由
  if (
    authRoutes.some((route) => pathname.startsWith(route)) ||
    isProtectedPath(pathname)
  ) {
    if (!isAuthenticated) {
      const fullUrl = request.url;
      const originalUrl = new URL(fullUrl);
      const fullPath = pathname + originalUrl.search + originalUrl.hash;
      const url = new URL("/", request.url);
      url.searchParams.set("showLogin", "true");
      url.searchParams.set("from", fullPath);
      return NextResponse.redirect(url);
    }
  }

  // 处理游客路由
  if (guestRoutes.some((route) => pathname.startsWith(route))) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // 添加安全相关的响应头
  const response = NextResponse.next();

  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  //TODO:生产环境配置客户可请求API域名
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; frame-src https://www.youtube.com https://www.youtube-nocookie.com https://challenges.cloudflare.com; connect-src 'self' http://localhost:8000 https://challenges.cloudflare.com; img-src 'self' data: https:; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.youtube.com https://s.ytimg.com https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline';"
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * 匹配所有路由除了：
     * - api 路由
     * - _next 静态文件
     * - public 文件
     */
    "/((?!api|_next/static|_next/image|.*\\..*).*)",
    // "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
