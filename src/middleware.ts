import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { fallbackLng, languages, cookieName } from './i18n/settings';

/**
 * 从请求头中获取最佳匹配的语言。
 * @param request - NextRequest 对象.
 * @returns 匹配到的语言代码，例如 "en" 或 "zh-TW".
 */
function getLocaleFromHeader(request: NextRequest): string {
  const acceptLanguageHeader = request.headers.get('Accept-Language');
  const headers = { 'accept-language': acceptLanguageHeader || '' };
  
  const languagesInHeader = new Negotiator({ headers }).languages();
  
  return match(languagesInHeader, languages, fallbackLng);
}

const isProtectedPath = (path: string): boolean => {
  if (/^\/u\/[^/]+\/settings/.test(path)) {
    return true;
  }
  return false;
};


export async function middleware(request: NextRequest) {
  const { pathname, search, hash } = request.nextUrl;

  // 1. 检查路径是否已经包含了语言前缀
  const pathnameHasLocale = languages.some(
    (loc) => pathname.startsWith(`/${loc}/`) || pathname === `/${loc}`
  );

  // 如果路径没有语言前缀，则进行检测和重定向
  if (!pathnameHasLocale) {
    // 决定语言的优先级顺序:
    // a) URL query param 'lang'
    // b) Cookie
    // c) Accept-Language header
    // d) Fallback language
    let lng = request.nextUrl.searchParams.get("lang");
    if (lng && !languages.includes(lng)) {
        lng = null; // 如果查询参数中的语言不被支持，则忽略
    }
    if (!lng && request.cookies.has(cookieName)) {
      const cookieValue = request.cookies.get(cookieName)!.value;
      if (languages.includes(cookieValue)) {
        lng = cookieValue;
      }
    }
    if (!lng) {
      lng = getLocaleFromHeader(request);
    }
    
    // 构建重定向 URL
    const redirectUrl = new URL(`/${lng}${pathname}${search}${hash}`, request.url);

    const response = NextResponse.redirect(redirectUrl);

    // 如果用户通过 ?lang=... 切换语言，将选择持久化到 cookie
    if (request.nextUrl.searchParams.has("lang")) {
      response.cookies.set(cookieName, lng, { path: '/' });
    }
    
    return response;
  }

  
  // 2. 认证逻辑
  const sessionToken =
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value;
  const isAuthenticated = !!sessionToken;

  // 移除路径中的语言前缀，以便于匹配路由规则
  const pathnameWithoutLocale = pathname.replace(`/${pathname.split('/')[1]}`, '') || '/';
  
  // 需要登录的路由
  const authRoutes = ['/bookmarked', '/following'];
  const guestRoutes = ["/login", "/register", "/forgot-password"];

  if (
    authRoutes.some((route) => pathnameWithoutLocale.startsWith(route)) ||
    isProtectedPath(pathnameWithoutLocale)
  ) {
    if (!isAuthenticated) {
      const fromUrl = `${pathname}${search}${hash}`;
      const url = new URL(`/${pathname.split('/')[1]}`, request.url); // 重定向到带语言的首页
      url.searchParams.set("showLogin", "true");
      url.searchParams.set("from", fromUrl);
      return NextResponse.redirect(url);
    }
  }

  // 处理游客路由
  if (guestRoutes.some((route) => pathnameWithoutLocale.startsWith(route))) {
    if (isAuthenticated) {
      const homeUrl = new URL(`/${pathname.split('/')[1]}`, request.url);
      return NextResponse.redirect(homeUrl);
    }
  }

  // 3. 添加安全相关的响应头
  const response = NextResponse.next();
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
  matcher: [
    "/((?!api|_next/static|_next/image|.*\\..*).*)",
  ],
};