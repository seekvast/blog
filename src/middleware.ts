import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { fallbackLng, languages, cookieName } from "./i18n/settings";

//检测语言
function getLocale(request: NextRequest): string {
  const cookieValue = request.cookies.get(cookieName)?.value;
  if (cookieValue && languages.includes(cookieValue)) {
    return cookieValue;
  }

  const acceptLanguageHeader = request.headers.get("Accept-Language") || "";
  const headers = { "accept-language": acceptLanguageHeader };
  const languagesInHeader = new Negotiator({ headers }).languages();

  try {
    return match(languagesInHeader, languages, fallbackLng);
  } catch (e) {
    return fallbackLng;
  }
}

// 处理用户认证和授权
function handleAuth(request: NextRequest): NextResponse | null {
  const { pathname, search, hash } = request.nextUrl;

  const sessionToken =
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value;
  const isAuthenticated = !!sessionToken;

  const isProtectedPath = (path: string): boolean =>
    /^\/u\/[^/]+\/settings/.test(path);

  const authRoutes = ["/bookmarked", "/following"];
  const guestRoutes = ["/login", "/register", "/forgot-password"];

  // 检查受保护路由
  if (
    authRoutes.some((route) => pathname.startsWith(route)) ||
    isProtectedPath(pathname)
  ) {
    if (!isAuthenticated) {
      const fromUrl = `${pathname}${search}${hash}`;
      const url = new URL(`/`, request.url); // 重定向到根目录首页
      url.searchParams.set("showLogin", "true");
      url.searchParams.set("from", fromUrl);
      return NextResponse.redirect(url);
    }
  }

  // 检查游客路由
  if (guestRoutes.some((route) => pathname.startsWith(route))) {
    if (isAuthenticated) {
      const homeUrl = new URL(`/`, request.url);
      return NextResponse.redirect(homeUrl);
    }
  }

  // 如果没有触发任何认证/授权规则，返回 null 继续执行
  return null;
}

export async function middleware(request: NextRequest) {
  const authResponse = handleAuth(request);
  if (authResponse) {
    return authResponse;
  }

  const lng = getLocale(request);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("k-locale", lng);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  if (request.cookies.get(cookieName)?.value !== lng) {
    response.cookies.set(cookieName, lng, { path: "/" });
  }

  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; frame-src https://www.youtube.com https://www.youtube-nocookie.com https://challenges.cloudflare.com; connect-src 'self' http://localhost:8000 https://challenges.cloudflare.com; img-src 'self' data: https:; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.youtube.com https://s.ytimg.com https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline';"
  );

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
