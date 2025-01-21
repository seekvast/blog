import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z } from 'zod'

export interface ValidateConfig {
  query?: z.ZodSchema
  params?: z.ZodSchema
  body?: z.ZodSchema
}

export function validate(config: ValidateConfig) {
  return async (request: NextRequest) => {
    try {
      const { query, params, body } = config
      
      // 验证查询参数
      if (query) {
        const searchParams = Object.fromEntries(request.nextUrl.searchParams)
        query.parse(searchParams)
      }

      // 验证路由参数
      if (params) {
        const routeParams = request.nextUrl.pathname
          .split('/')
          .filter(Boolean)
          .reduce((acc, curr, i) => {
            if (curr.startsWith('[') && curr.endsWith(']')) {
              const key = curr.slice(1, -1)
              acc[key] = request.nextUrl.pathname.split('/')[i + 1]
            }
            return acc
          }, {} as Record<string, string>)
        params.parse(routeParams)
      }

      // 验证请求体
      if (body && request.body) {
        const json = await request.json()
        body.parse(json)
      }

      return NextResponse.next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: error.errors
          },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}
