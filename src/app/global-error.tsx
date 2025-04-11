"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("全局错误:", error);
  }, [error]);

  return (
    <html lang="zh-CN">
      <body>
        <div className="container flex h-screen items-center justify-center">
          <div className="w-full max-w-md text-center">
            <div className="mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-12 w-12 text-destructive mx-auto"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </svg>
            </div>
            <h1 className="mb-2 text-2xl font-bold">系统错误</h1>
            <p className="mb-8 text-muted-foreground">
              抱歉，系统发生了错误。我们已记录此问题并正在紧急修复。
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
              <div className="mt-6 p-4 bg-muted rounded-md text-sm overflow-auto text-left">
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
          </div>
        </div>
      </body>
    </html>
  );
}
