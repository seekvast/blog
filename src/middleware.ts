import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 需要登录的路由
const authRoutes = [
  '/posts/create',
  '/posts/edit',
  '/settings',
  '/profile'
]

// 游客路由（已登录用户不能访问）
const guestRoutes = [
  '/login',
  '/register',
  '/forgot-password'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 获取 token
  const token = request.cookies.get('token')?.value
  const isAuthenticated = !!token

  // 处理需要登录的路由
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      const url = new URL('/login', request.url)
      url.searchParams.set('from', pathname)
      return NextResponse.redirect(url)
    }
  }

  // 处理游客路由
  if (guestRoutes.some(route => pathname.startsWith(route))) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // 添加安全相关的响应头
  const response = NextResponse.next()
  
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  )
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; connect-src 'self' http://localhost:8000 http://api.kater.host; img-src 'self' data: https:; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  )

  return response
}

export const config = {
  matcher: [
    /*
     * 匹配所有路由除了：
     * - api 路由
     * - _next 静态文件
     * - public 文件
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ]
}
