"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface NotFoundContentProps {
  title?: string;
  description?: string;
  backButton?: boolean;
  homeButton?: boolean;
}

export function NotFoundContent({
  title = "页面未找到",
  description = "抱歉，您访问的页面不存在或已被移除。",
  backButton = true,
  homeButton = true,
}: NotFoundContentProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <h1 className="mb-2 text-2xl font-bold">{title}</h1>
      <p className="text-muted-foreground mb-8">{description}</p>

      <div className="flex gap-4">
        {backButton && (
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="min-w-[120px]"
          >
            返回上页
          </Button>
        )}
        {homeButton && (
          <Link href="/">
            <Button className="bg-primary hover:bg-primary/80 text-white min-w-[120px]">
              回首页
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
