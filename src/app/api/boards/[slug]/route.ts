import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { api } from '@/lib/api'
import { validate } from '@/middleware/validate'
import { withErrorHandler, ApiError } from '@/middleware/error'
import { API_ROUTES } from '@/constants/api'

export const dynamic = 'force-dynamic'

export const GET = withErrorHandler(async (request: NextRequest, { params }: { params: { slug: string } }) => {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.token) {
      throw new ApiError('Unauthorized', 401)
    }

    const response = await api.get(API_ROUTES.BOARDS.DETAIL(params.slug), {
      headers: {
        Authorization: `Bearer ${session.user.token}`
      }
    })

    return NextResponse.json(response)
  } catch (error) {
    throw error
  }
})
