"use client";

import { signOut } from "next-auth/react";
import type { ApiError } from "./types";
import { toast } from "@/components/ui/use-toast";

type ErrorHandler = (error: ApiError) => void | Promise<void>;

const errorHandlers: ErrorHandler[] = [];

export const errorMiddleware = {
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

export async function handleApiError(error: unknown): Promise<void> {
  if (error instanceof Error) {
    const apiError = error as ApiError;

    // 处理网络错误
    if (!window.navigator.onLine) {
      toast({
        title: "网络错误",
        description: "请检查您的网络连接",
        variant: "destructive",
      });
      return;
    }

    // 处理请求超时
    if (error.name === "TimeoutError") {
      toast({
        title: "请求超时",
        description: "服务器响应时间过长，请稍后重试",
        variant: "destructive",
      });
      return;
    }

    // 处理 HTTP 状态错误
    if (apiError.status) {
      switch (apiError.status) {
        case 401:
          await signOut({ redirect: true });
          toast({
            title: "登录已过期",
            description: "请重新登录",
            variant: "destructive",
          });
          break;

        case 403:
          toast({
            title: "权限不足",
            description: "您没有权限执行此操作",
            variant: "destructive",
          });
          break;

        case 404:
          // 创建一个特殊的 404 错误，可以被 ErrorBoundary 识别
          const notFoundError = new Error("请求的资源不存在或已被删除");
          notFoundError.name = "NotFoundError";
          (notFoundError as any).status = 404;
          
          // 显示一个 toast 提示
        //   toast({
        //     title: "资源不存在",
        //     description: "请求的资源不存在或已被删除",
        //     variant: "destructive",
        //   });
          
          // 抛出错误，让 ErrorBoundary 捕获
          throw notFoundError;
          break;

        case 422:
          const validationErrors = apiError.data?.errors;
          toast({
            title: "验证错误",
            description: validationErrors
              ? formatValidationErrors(validationErrors)
              : apiError.message || "请检查输入是否正确",
            variant: "destructive",
          });
          break;

        case 429:
          toast({
            title: "请求过于频繁",
            description: "请稍后再试",
            variant: "destructive",
          });
          break;

        case 500:
        case 502:
        case 503:
        case 504:
          toast({
            title: "服务器错误",
            description: "服务器暂时无法处理您的请求，请稍后重试",
            variant: "destructive",
          });
          break;

        default:
          if (apiError.status >= 500) {
            toast({
              title: "服务器错误",
              description: "服务器暂时无法处理您的请求，请稍后重试",
              variant: "destructive",
            });
          } else {
            toast({
              title: "请求失败",
              description: apiError.message || "操作未能完成，请重试",
              variant: "destructive",
            });
          }
      }
      return;
    }

    // 处理业务错误码
    if (apiError.code) {
      switch (apiError.code) {
        case 4001:
          // 清理登录状态
          await signOut({ redirect: false });
          // 打开登录窗口
          const { useAuthModal } = await import(
            "@/components/auth/auth-modal-store"
          );
          const store = useAuthModal.getState();
          store.openLogin();
          toast({
            title: "请登录",
            description: "请登录后继续",
            variant: "destructive",
          });
          break;
        case 1001:
          toast({
            title: "登录失败",
            description: "用户名或密码错误",
            variant: "destructive",
          });
          break;
        case 1002:
          toast({
            title: "账号已禁用",
            description: "您的账号已被禁用，请联系管理员",
            variant: "destructive",
          });
          break;
        case 1003:
          toast({
            title: "验证码错误",
            description: "请输入正确的验证码",
            variant: "destructive",
          });
          break;
        default:
          toast({
            title: "操作失败",
            description: apiError.message || "请求未能完成，请重试",
            variant: "destructive",
          });
      }
      return;
    }

    // 处理其他错误
    toast({
      title: "错误",
      description: apiError.message || "发生未知错误，请重试",
      variant: "destructive",
    });
  } else {
    // 处理非 Error 类型的错误
    toast({
      title: "错误",
      description: "发生未知错误，请重试",
      variant: "destructive",
    });
  }

  // 运行自定义错误处理器
  for (const handler of errorHandlers) {
    await handler(error as ApiError);
  }
}
