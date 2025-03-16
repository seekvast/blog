import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { ApiError } from "@/middleware/error";

/**
 * 创建标准化的错误响应
 */
export function createErrorResponse(
  error: unknown,
  status: number = 500
): NextResponse {
  // 记录错误日志
  logger.error("API错误", {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    status,
  });

  // 格式化错误响应
  const errorMessage =
    error instanceof Error ? error.message : "Internal server error";
  const errorData = error instanceof ApiError ? error.data : undefined;
  const statusCode = error instanceof ApiError ? error.statusCode : status;

  return NextResponse.json(
    {
      success: false,
      error: errorMessage,
      code: statusCode,
      data: errorData,
    },
    { status: statusCode }
  );
}

/**
 * 安全地执行API处理函数，捕获并处理错误
 */
export async function safelyExecuteHandler<T>(
  handler: () => Promise<T>,
  errorStatus: number = 500
): Promise<NextResponse> {
  try {
    const result = await handler();
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return createErrorResponse(error, errorStatus);
  }
}
