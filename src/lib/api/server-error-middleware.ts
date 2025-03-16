import { ApiError } from "./types";
import { logger } from "@/lib/logger"; // 导入日志模块

type ErrorHandler = (error: ApiError) => void | Promise<void>;

const errorHandlers: ErrorHandler[] = [];

export const serverErrorMiddleware = {
  use: (handler: ErrorHandler) => {
    errorHandlers.push(handler);
    return () => {
      const index = errorHandlers.indexOf(handler);
      if (index !== -1) errorHandlers.splice(index, 1);
    };
  },
};

function formatValidationErrors(errors: Record<string, string[]>): string {
  return Object.entries(errors)
    .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
    .join("\n");
}

/**
 * 服务端API错误处理函数
 * 处理服务端API请求中发生的错误
 */
export async function handleServerApiError(error: unknown): Promise<void> {
  if (error instanceof Error) {
    const apiError = error as ApiError;

    // 记录详细错误信息
    const errorDetails = {
      message: apiError.message || "未知错误",
      status: apiError.status,
      code: apiError.code,
      stack: apiError.stack,
    };

    // 根据错误类型进行不同的处理
    if (apiError.status) {
      switch (apiError.status) {
        case 401:
          logger.warn("认证失败", { ...errorDetails, level: "warn" });
          break;

        case 403:
          logger.warn("权限不足", { ...errorDetails, level: "warn" });
          break;

        case 404:
          logger.info("资源不存在", { ...errorDetails, level: "info" });
          break;

        case 422:
          const validationErrors = apiError.data?.errors;
          logger.warn("验证错误", {
            ...errorDetails,
            validationDetails: validationErrors
              ? formatValidationErrors(validationErrors)
              : undefined,
            level: "warn",
          });
          break;

        case 429:
          logger.warn("请求频率限制", { ...errorDetails, level: "warn" });
          break;

        case 500:
        case 502:
        case 503:
        case 504:
          logger.error("服务器错误", { ...errorDetails, level: "error" });
          // 这里可以添加告警逻辑，例如发送通知到监控系统
          break;

        default:
          if (apiError.status >= 500) {
            logger.error("服务器错误", { ...errorDetails, level: "error" });
          } else {
            logger.warn("请求失败", { ...errorDetails, level: "warn" });
          }
      }
    } else if (apiError.code) {
      // 处理业务错误码
      switch (apiError.code) {
        case 1001:
          logger.warn("登录失败", { ...errorDetails, level: "warn" });
          break;
        case 1002:
          logger.warn("账号已禁用", { ...errorDetails, level: "warn" });
          break;
        case 1003:
          logger.warn("验证码错误", { ...errorDetails, level: "warn" });
          break;
        default:
          logger.warn("业务逻辑错误", { ...errorDetails, level: "warn" });
      }
    } else {
      // 处理其他错误
      logger.error("未分类错误", { ...errorDetails, level: "error" });
    }
  } else {
    // 处理非 Error 类型的错误
    logger.error("未知类型错误", {
      error: String(error),
      level: "error",
    });
  }

  // 运行自定义错误处理器
  for (const handler of errorHandlers) {
    await handler(error as ApiError);
  }
}
