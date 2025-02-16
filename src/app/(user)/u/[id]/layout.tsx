"use client";

import { useParams, usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const userId = params?.id as string;
  const isSettingsPage = pathname?.includes(`/u/${userId}/settings`) ?? false;
  const { data: session } = useSession();
  
  // 获取用户详细信息
  const { data: userData } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => api.users.get({ hashid: userId }),
    enabled: !!userId,
  });
    console.log(userData?.created_at , 'ullll')
  const isCurrentUser = session?.user?.hashid === userId;

  if (!userData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">加载用户信息中...</div>
      </div>
    );
  }

  return (
    <div>
      {/* 顶部用户信息区 */}
      {!isSettingsPage && (
        <div className="w-full bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 pb-20 pt-10">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-24 w-24 border-4 border-background">
                  <AvatarImage src={userData.avatar_url || "/placeholder-avatar.jpg"} />
                  <AvatarFallback>{userData.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <h1 className="text-2xl font-semibold">{userData.username}</h1>
                    <span className="text-sm text-muted-foreground">
                      @{userData.nickname}
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    加入时间：{userData.created_at ? new Date(userData.created_at).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : '未知'}
                  </p>
                </div>
              </div>
              {isCurrentUser && (
                <Button size="sm" className="rounded-full primary" asChild>
                  <Link href={`/u/${userId}/settings`}>修改个人信息</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 内容区 */}
      <div className="mx-auto max-w-7xl px-4 overflow-hidden">{children}</div>
    </div>
  );
}
