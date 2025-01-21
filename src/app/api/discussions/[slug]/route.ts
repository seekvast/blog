import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { api } from '@/lib/api'
import { validate } from '@/middleware/validate'
import { withErrorHandler, ApiError } from '@/middleware/error'
import { updateDiscussionSchema } from '@/validations/discussion'
import { API_ROUTES } from '@/constants/api'

export const dynamic = 'force-dynamic'

// GET /api/discussions/[slug]
export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: { slug: string } }
) => {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.token) {
      throw new ApiError('Unauthorized', 401)
    }

    const response = await api.get(`${API_ROUTES.DISCUSSIONS}/${params.slug}`, {
      headers: {
        Authorization: `Bearer ${session.user.token}`
      }
    })

    return NextResponse.json(response)
  } catch (error) {
    throw new ApiError('Failed to fetch discussion', 500)
  }
})

// PATCH /api/discussions/[slug]
export const PATCH = withErrorHandler(async (request: NextRequest) => {
  const slug = request.nextUrl.pathname.split('/').pop()
  await validate({ body: updateDiscussionSchema })(request)

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.token) {
      throw new ApiError('Unauthorized', 401)
    }

    const body = await request.json()
    const response = await api.patch(
      `${API_ROUTES.DISCUSSIONS}/${slug}`,
      body,
      {
        headers: {
          Authorization: `Bearer ${session.user.token}`
        }
      }
    )

    return NextResponse.json(response)
  } catch (error) {
    throw new ApiError('Failed to update discussion', 500)
  }
})

// DELETE /api/discussions/[slug]
export const DELETE = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: { slug: string } }
) => {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.token) {
      throw new ApiError('Unauthorized', 401)
    }

    await api.delete(`${API_ROUTES.DISCUSSIONS}/${params.slug}`, {
      headers: {
        Authorization: `Bearer ${session.user.token}`
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    throw new ApiError('Failed to delete discussion', 500)
  }
})
