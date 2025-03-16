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
export async function handleServerApiError(error: unknown): Promise<ApiError> {
  let formattedError: ApiError | null = null;

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
          formattedError = {
            ...apiError,
            message: "认证失败，请重新登录",
          };
          break;

        case 403:
          logger.warn("权限不足", { ...errorDetails, level: "warn" });
          formattedError = {
            ...apiError,
            message: "权限不足，您没有权限执行此操作",
          };
          break;

        case 404:
          logger.info("资源不存在", { ...errorDetails, level: "info" });
          formattedError = {
            ...apiError,
            message: "请求的资源不存在或已被删除",
          };
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
          formattedError = {
            ...apiError,
            message: validationErrors
              ? formatValidationErrors(validationErrors)
              : "请检查输入是否正确",
          };
          break;

        case 429:
          logger.warn("请求频率限制", { ...errorDetails, level: "warn" });
          formattedError = {
            ...apiError,
            message: "请求过于频繁，请稍后再试",
          };
          break;

        case 500:
        case 502:
        case 503:
        case 504:
          logger.error("服务器错误", { ...errorDetails, level: "error" });
          formattedError = {
            ...apiError,
            message: "服务器暂时无法处理您的请求，请稍后重试",
          };
          break;

        default:
          if (apiError.status >= 500) {
            logger.error("服务器错误", { ...errorDetails, level: "error" });
            formattedError = {
              ...apiError,
              message: "服务器暂时无法处理您的请求，请稍后重试",
            };
          } else {
            logger.warn("请求失败", { ...errorDetails, level: "warn" });
            formattedError = {
              ...apiError,
              message: apiError.message || "操作未能完成，请重试",
            };
          }
      }
    } else if (apiError.code) {
      // 处理业务错误码
      switch (apiError.code) {
        case 1001:
          logger.warn("登录失败", { ...errorDetails, level: "warn" });
          formattedError = {
            ...apiError,
            message: "用户名或密码错误",
          };
          break;
        case 1002:
          logger.warn("账号已禁用", { ...errorDetails, level: "warn" });
          formattedError = {
            ...apiError,
            message: "您的账号已被禁用，请联系管理员",
          };
          break;
        case 1003:
          logger.warn("验证码错误", { ...errorDetails, level: "warn" });
          formattedError = {
            ...apiError,
            message: "请输入正确的验证码",
          };
          break;
        default:
          logger.warn("业务逻辑错误", { ...errorDetails, level: "warn" });
          formattedError = {
            ...apiError,
            message: apiError.message || "请求未能完成，请重试",
          };
      }
    } else {
      // 处理其他错误
      logger.error("未分类错误", { ...errorDetails, level: "error" });
      formattedError = {
        ...apiError,
        message: apiError.message || "发生未知错误，请重试",
      };
    }
  } else {
    // 处理非 Error 类型的错误
    logger.error("未知类型错误", {
      error: String(error),
      level: "error",
    });
    formattedError = {
      name: "Error",
      message: "发生未知错误，请重试",
    } as ApiError;
  }

  // 运行自定义错误处理器
  for (const handler of errorHandlers) {
    await handler(error as ApiError);
  }

  // 返回格式化后的错误对象，以便传递给客户端
  return formattedError || (error as ApiError);
}
