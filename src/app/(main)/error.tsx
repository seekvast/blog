"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { ApiError } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & {
    digest?: string;
    status?: number;
    code?: number;
    data?: any;
  };
  reset: () => void;
}) {
  useEffect(() => {
    // 记录错误到控制台
    console.error("页面错误:", error);

    // 使用 toast 组件显示错误信息
    const apiError = error as ApiError;

    // 根据错误类型显示不同的提示
    if (apiError.status) {
      switch (apiError.status) {
        case 401:
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
          toast({
            title: "资源不存在",
            description: "请求的资源不存在或已被删除",
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
    } else if (apiError.code) {
      // 处理业务错误码
      toast({
        title: "操作失败",
        description: apiError.message || "请求未能完成，请重试",
        variant: "destructive",
      });
    } else {
      // 处理其他错误
      toast({
        title: "发生错误",
        description: error.message || "操作未能完成，请重试",
        variant: "destructive",
      });
    }
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
            抱歉，页面加载时发生错误。您可以尝试重新加载。
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
