import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { api } from "@/lib/api";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    return NextResponse.json(session || { user: null });
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// 添加 POST 方法处理 session 更新
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json().catch(() => ({}));
    if (body.data.refresh === true) {
        const user = await api.users.get({ hashid: session.user.hashid });
        session.user = {
          id: user.hashid,
          hashid: user.hashid,
          username: user.username,
          nickname: user.nickname,
          avatar_url: user.avatar_url,
          cover: user.cover,
          bio: user.bio,
          gender: user.gender,
          birthday: user.birthday,
          is_email_confirmed: user.is_email_confirmed,
          joined_at: user.joined_at,
          last_seen_at: user.last_seen_at,
          preferences: user.preferences,
          token: user.token,
        };
        return NextResponse.json(session || { user: null });
    }
    return NextResponse.json(session || { user: null });
  } catch (error) {
    console.error("Session update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
