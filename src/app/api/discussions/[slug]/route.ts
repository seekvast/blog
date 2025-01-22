import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { api } from '@/lib/api'
import { withErrorHandler, ApiError } from '@/middleware/error'

export const dynamic = 'force-dynamic'

export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: { slug: string } }
) => {
  try {
    const response = await api.get(`/discussions/${params.slug}`)
    return NextResponse.json(response)
  } catch (error) {
    throw new ApiError('Failed to fetch discussion', 500)
  }
})
