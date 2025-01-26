import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { api } from '@/lib/api'
import { validate } from '@/middleware/validate'
import { withErrorHandler, ApiError } from '@/middleware/error'
import { discussionQuerySchema, createDiscussionSchema } from '@/validations/discussion'
// import { API_ROUTES } from '@/constants/api'

export const dynamic = 'force-dynamic'

// GET /api/discussions
export const GET = withErrorHandler(async (request: NextRequest) => {
  await validate({ query: discussionQuerySchema })(request)
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.token) {
      throw new ApiError('Unauthorized', 401)
    }

    const searchParams = request.nextUrl.searchParams
    const queryParams: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      queryParams[key] = value
    })
    const response = await api.discussions.list(queryParams)

    return NextResponse.json(response)
  } catch (error) {
    throw new ApiError('Failed to fetch discussions', 500)
  }
})
