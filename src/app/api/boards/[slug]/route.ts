import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { api } from '@/lib/api'
import { withErrorHandler, ApiError } from '@/middleware/error'

export const dynamic = 'force-dynamic'

export const GET = withErrorHandler(async (request: NextRequest, { params }: { params: { slug: string } }) => {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.token) {
      throw new ApiError('Unauthorized', 401)
    }

    const response = await api.boards.list(params)

    return NextResponse.json(response)
  } catch (error) {
    throw error
  }
})
