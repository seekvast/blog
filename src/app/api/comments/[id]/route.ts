import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { api } from '@/lib/api'
import { validate } from '@/middleware/validate'
import { withErrorHandler, ApiError } from '@/middleware/error'
import { updateCommentSchema } from '@/validations/comment'
import { API_ROUTES } from '@/constants/api'

export const dynamic = 'force-dynamic'

// GET /api/comments/[id]
export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.token) {
      throw new ApiError('Unauthorized', 401)
    }

    const response = await api.get(`${API_ROUTES.COMMENTS}/${params.id}`, {
      headers: {
        Authorization: `Bearer ${session.user.token}`
      }
    })

    return NextResponse.json(response)
  } catch (error) {
    throw new ApiError('Failed to fetch comment', 500)
  }
})

// PATCH /api/comments/[id]
export const PATCH = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  await validate({ body: updateCommentSchema })(request)

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.token) {
      throw new ApiError('Unauthorized', 401)
    }

    const body = await request.json()
    const response = await api.patch(
      `${API_ROUTES.COMMENTS}/${params.id}`,
      body,
      {
        headers: {
          Authorization: `Bearer ${session.user.token}`
        }
      }
    )

    return NextResponse.json(response)
  } catch (error) {
    throw new ApiError('Failed to update comment', 500)
  }
})

// DELETE /api/comments/[id]
export const DELETE = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.token) {
      throw new ApiError('Unauthorized', 401)
    }

    await api.delete(`${API_ROUTES.COMMENTS}/${params.id}`, {
      headers: {
        Authorization: `Bearer ${session.user.token}`
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    throw new ApiError('Failed to delete comment', 500)
  }
})
