import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { http } from "@/lib/request";

// 标记该路由为动态路由
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.token) {
      return NextResponse.json(
        { code: 401, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const keyword = searchParams.get("keyword") || "";

    const response = await http.get(`/users`, {
      params: { keyword },
      headers: {
        Authorization: `Bearer ${session.user.token}`,
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      { code: 500, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
