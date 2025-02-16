"use client";

import { useParams, usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const userId = params?.id as string;
  const isSettingsPage = pathname.includes(`/u/${userId}/settings`);

  return (
    <div>
      {/* 顶部用户信息区 */}
      {!isSettingsPage && (
        <div className="w-full bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 pb-20 pt-10">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-24 w-24 border-4 border-background">
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback>UN</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <h1 className="text-2xl font-semibold">Ronald Richards</h1>
                    <span className="text-sm text-muted-foreground">
                      @Richards
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    加入时间：2024年1月11日
                  </p>
                </div>
              </div>
              <Button size="sm" className="rounded-full primary" asChild>
                <Link href={`/u/${userId}/settings`}>修改个人信息</Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 内容区 */}
      <div className="mx-auto max-w-7xl">{children}</div>
    </div>
  );
}
