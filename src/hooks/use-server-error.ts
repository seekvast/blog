"use client";

import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";

interface ServerErrorOptions {
  showToast?: boolean;
  onError?: (error: any) => void;
}

/**
 * 服务端错误处理Hook
 * 用于在客户端组件中处理服务端错误
 */
export function useServerError(
  serverError?: any,
  options: ServerErrorOptions = {}
) {
  const { showToast = true, onError } = options;
  const [error, setError] = useState<any>(serverError);
  const [hasError, setHasError] = useState<boolean>(!!serverError);

  useEffect(() => {
    if (serverError) {
      setError(serverError);
      setHasError(true);

      // 显示错误提示
      if (showToast) {
        const errorMessage =
          typeof serverError === "object"
            ? serverError.message || "服务器错误"
            : String(serverError);

        toast({
          title: "发生错误",
          description: errorMessage,
          variant: "default",
        });
      }

      // 调用自定义错误处理函数
      if (onError) {
        onError(serverError);
      }
    }
  }, [serverError, showToast, onError]);

  // 清除错误
  const clearError = () => {
    setError(null);
    setHasError(false);
  };

  return {
    error,
    hasError,
    clearError,
  };
}
