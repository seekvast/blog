"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <div className="container relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <h1 className="text-2xl font-semibold text-destructive">验证错误</h1>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <AlertTriangle className="w-12 h-12 mx-auto text-destructive" />
            <p className="text-muted-foreground">{error.message}</p>
            <div className="space-y-3 pt-4">
              <Button
                onClick={() => reset()}
                variant="outline"
                className="w-full"
              >
                重试
              </Button>
              <Button onClick={() => router.push("/login")} className="w-full">
                返回登录
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
