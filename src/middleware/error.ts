import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function withErrorHandler<T extends { params: Record<string, string> }>(
  handler: (request: NextRequest, context: T) => Promise<Response>
) {
  return async (request: NextRequest, context: T) => {
    try {
      return await handler(request, context)
    } catch (error) {

      if (error instanceof ApiError) {
        return NextResponse.json(
          {
            error: error.message,
            data: error.data
          },
          { status: error.statusCode }
        )
      }

      // 默认错误响应
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}
