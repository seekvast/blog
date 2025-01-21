import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { api } from "@/lib/api";
import { validate } from '@/middleware/validate'
import { withErrorHandler, ApiError } from '@/middleware/error'
import { userQuerySchema } from '@/validations/user'

// 标记该路由为动态路由
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const GET = withErrorHandler(async (request: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.token) {
      return NextResponse.json(
        { code: 401, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // 验证查询参数
    await validate({ query: userQuerySchema })(request)

    const searchParams = request.nextUrl.searchParams;
    const keyword = searchParams.get("keyword") || "";

    const response = await api.get(`/users`, {
      params: { keyword },
      headers: {
        Authorization: `Bearer ${session.user.token}`,
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error searching users:", error);
    throw new ApiError('Failed to fetch users', 500)
  }
})
