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
    console.error("错误边界示例错误:", error);
  }, [error]);

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-md mx-auto border-yellow-200 bg-yellow-50">
        <CardHeader className="flex flex-col items-center">
          <AlertTriangle className="h-12 w-12 text-yellow-600 mb-2" />
          <CardTitle className="text-xl text-yellow-800">
            错误边界示例错误
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-yellow-700 mb-6 text-center">
            这是一个特定于错误边界示例路由的错误页面。
            它捕获了该路由下的所有未处理错误。
          </p>
          <div className="flex justify-center">
            <Button
              onClick={reset}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              重试
            </Button>
          </div>
          {process.env.NODE_ENV !== "production" && (
            <div className="mt-6 p-4 bg-white rounded-md text-sm overflow-auto">
              <p className="font-medium">错误信息:</p>
              <p className="text-red-500">{error.message}</p>
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
