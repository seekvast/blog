import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { api } from '@/lib/api'
import { validate } from '@/middleware/validate'
import { withErrorHandler, ApiError } from '@/middleware/error'
import { discussionQuerySchema } from '@/validations/discussion'
import { API_ROUTES } from '@/constants/api'

export const dynamic = 'force-dynamic'

export const GET = withErrorHandler(async (request: NextRequest, { params }: { params: { slug: string } }) => {
  await validate({ query: discussionQuerySchema })(request)

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.token) {
      throw new ApiError('Unauthorized', 401)
    }

    const searchParams = request.nextUrl.searchParams
    const response = await api.get(`${API_ROUTES.BOARDS}/${params.slug}/discussions`, {
      params: Object.fromEntries(searchParams),
      headers: {
        Authorization: `Bearer ${session.user.token}`
      }
    })

    return NextResponse.json(response)
  } catch (error) {
    throw error
  }
})
