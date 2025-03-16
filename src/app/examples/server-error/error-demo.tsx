"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useServerError } from "@/hooks/use-server-error";
import { ServerErrorBoundary } from "@/components/error/server-error-boundary";

interface ErrorDemoProps {
  serverError?: any;
}

function ErrorDemoContent({ serverError }: ErrorDemoProps) {
  const { error, hasError, clearError } = useServerError(serverError);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // 测试不同类型的API错误
  const testApiError = async (type: string) => {
    setLoading(true);
    setApiError(null);

    try {
      const response = await fetch(`/api/example/error?type=${type}`);
      const data = await response.json();

      if (!data.success) {
        setApiError(data.error || "未知错误");
      } else {
        setApiError(null);
      }
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "请求失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 服务端错误显示 */}
      {hasError && (
        <Card className="border-red-300 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600">服务端错误</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{String(error)}</p>
            <Button variant="outline" className="mt-4" onClick={clearError}>
              清除错误
            </Button>
          </CardContent>
        </Card>
      )}

      {/* API错误测试 */}
      <Card>
        <CardHeader>
          <CardTitle>测试API错误</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <Button
              variant="outline"
              onClick={() => testApiError("validation")}
              disabled={loading}
            >
              验证错误
            </Button>
            <Button
              variant="outline"
              onClick={() => testApiError("notfound")}
              disabled={loading}
            >
              资源不存在
            </Button>
            <Button
              variant="outline"
              onClick={() => testApiError("unauthorized")}
              disabled={loading}
            >
              未授权
            </Button>
            <Button
              variant="outline"
              onClick={() => testApiError("forbidden")}
              disabled={loading}
            >
              权限不足
            </Button>
            <Button
              variant="outline"
              onClick={() => testApiError("server")}
              disabled={loading}
            >
              服务器错误
            </Button>
            <Button
              variant="outline"
              onClick={() => testApiError("business")}
              disabled={loading}
            >
              业务错误
            </Button>
            <Button
              variant="outline"
              onClick={() => testApiError("default")}
              disabled={loading}
            >
              默认错误
            </Button>
            <Button
              variant="outline"
              onClick={() => testApiError("success")}
              disabled={loading}
            >
              成功请求
            </Button>
          </div>

          {/* API错误显示 */}
          {apiError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-300 rounded-md">
              <p className="text-red-600">{apiError}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function ErrorDemo(props: ErrorDemoProps) {
  return (
    <ServerErrorBoundary error={props.serverError}>
      <ErrorDemoContent {...props} />
    </ServerErrorBoundary>
  );
}
