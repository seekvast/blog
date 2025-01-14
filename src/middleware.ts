import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  try {
    // 这里是您的中间件逻辑
    return NextResponse.next();
  } catch (error: any) {
    console.error('Middleware Error:', error);

    return new NextResponse(
      JSON.stringify({
        success: false,
        message: error.message,
        stack: error.stack,
        digest: error.digest,
      }),
      {
        status: 500,
        headers: {
          'content-type': 'application/json',
        },
      }
    );
  }
}

export const config = {
  matcher: '/api/:path*',
};
