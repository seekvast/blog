import { NextRequest, NextResponse } from "next/server";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { headers } from "next/headers";

/**
 * 验证 Cloudflare Turnstile token 的 API 路由
 */
export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body = await request.json();
    const { token } = body;

    // 检查 token 是否存在
    if (!token) {
      return NextResponse.json(
        { success: false, message: "缺少验证 token" },
        { status: 400 }
      );
    }

    // 获取用户 IP
    const headersList = headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0] : null;

    // 验证 token
    const result = await verifyTurnstileToken(token, ip || undefined);

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: "人机验证失败",
          error_codes: result.error_codes 
        },
        { status: 400 }
      );
    }

    // 验证成功
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("验证 Turnstile token 时出错:", error);
    return NextResponse.json(
      { success: false, message: "验证过程中出错" },
      { status: 500 }
    );
  }
}
