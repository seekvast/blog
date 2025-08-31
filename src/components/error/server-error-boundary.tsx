"use client";

import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";

interface ServerErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  error?: any; // 服务端传递的错误
}

/**
 * 服务端错误边界组件
 * 用于捕获服务端渲染时的错误并在客户端显示
 */
export function ServerErrorBoundary({
  children,
  fallback,
  error,
}: ServerErrorBoundaryProps) {
  const [hasError, setHasError] = useState<boolean>(!!error);

  useEffect(() => {
    // 如果有服务端传递的错误，显示错误提示
    if (error) {
      const errorMessage =
        typeof error === "object"
          ? error.message || "服务器错误"
          : String(error);

      toast({
        title: "发生错误",
        description: errorMessage,
        variant: "default",
      });
    }
  }, [error]);

  if (hasError && fallback) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * 高阶组件，用于包装页面组件，处理服务端错误
 */
export function withServerErrorHandling<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function WithServerErrorHandling(props: P & { serverError?: any }) {
    const { serverError, ...rest } = props;

    return (
      <ServerErrorBoundary error={serverError} fallback={fallback}>
        <Component {...(rest as P)} />
      </ServerErrorBoundary>
    );
  };
}
