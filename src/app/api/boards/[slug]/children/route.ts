import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { api } from '@/lib/api'
import { validate } from '@/middleware/validate'
import { withErrorHandler, ApiError } from '@/middleware/error'
import { API_ROUTES } from '@/constants/api'

export const dynamic = 'force-dynamic'

export const GET = withErrorHandler(async (request: NextRequest) => {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.token) {
      throw new ApiError('Unauthorized', 401)
    }

    // Get the slug from the URL instead of params
    const slug = request.nextUrl.pathname.split('/')[3]
    
    const response = await api.get(`${API_ROUTES.BOARDS}/${slug}/children`, {
      headers: {
        Authorization: `Bearer ${session.user.token}`
      }
    })

    return NextResponse.json(response)
  } catch (error) {
    throw error
  }
})
