import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query } },
          { nickname: { contains: query } },
        ],
      },
      select: {
        id: true,
        username: true,
        nickname: true,
        avatar_url: true,
      },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to search users",
      },
      { status: 500 }
    );
  }
}
