"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 记录错误到控制台或监控系统
    console.error("路由错误:", error);
  }, [error]);

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-md mx-auto">
        <CardHeader className="flex flex-col items-center">
          <AlertTriangle className="h-12 w-12 text-destructive mb-2" />
          <CardTitle className="text-xl">页面加载出错</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6 text-center">
            抱歉，页面加载过程中发生错误。我们已记录此问题并正在修复。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={reset} className="w-full sm:w-auto">
              重试
            </Button>
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => (window.location.href = "/")}
            >
              返回首页
            </Button>
          </div>
          {process.env.NODE_ENV !== "production" && (
            <div className="mt-6 p-4 bg-muted rounded-md text-sm overflow-auto">
              <p className="font-medium">错误信息:</p>
              <p className="text-destructive">{error.message}</p>
              {error.stack && (
                <>
                  <p className="font-medium mt-2">堆栈信息:</p>
                  <pre className="text-xs mt-1 whitespace-pre-wrap">
                    {error.stack}
                  </pre>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
