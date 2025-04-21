"use client";

import { useParams, usePathname, useSearchParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Settings, Flag, AlertTriangle, Ban, Unlock } from "lucide-react";
import Link from "next/link";
import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import { ReportDialog } from "@/components/report/report-dialog";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const username = params?.id as string;
  const hashid = searchParams?.get("hashid");
  const isSettingsPage = pathname?.includes(`/u/${username}/settings`) ?? false;
  const { data: session } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [reportToKaterOpen, setReportToKaterOpen] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  // 获取用户详细信息
  const { data: userData } = useQuery({
    queryKey: ["user", hashid],
    queryFn: () => api.users.get({ hashid: hashid }),
    enabled: !!hashid,
  });
  const isCurrentUser = session?.user?.hashid === userData?.hashid;
  // 使用 useEffect 处理 blocked 状态
  useEffect(() => {
    if (userData?.blocked) {
      setIsBlocked(true);
    }
  }, [userData?.blocked]);

  // 拉黑用户
  const blockMutation = useMutation({
    mutationFn: (block_user_hashid: string) =>
      api.users.block({ block_user_hashid }),
    onSuccess: (response) => {
      setIsBlocked(!isBlocked);
      toast({
        title: "成功",
        description: isBlocked
          ? "已将该用户从黑名单中移除"
          : "已将该用户加入黑名单",
      });

      // 刷新用户数据
      queryClient.invalidateQueries({ queryKey: ["user", username] });
    },
    onError: (error) => {
      toast({
        title: "拉黑失败",
        description: error.message || "操作失败，请稍后重试",
        variant: "destructive",
      });
    },
  });

  const handleBlock = (block_user_hashid: string) => {
    blockMutation.mutate(block_user_hashid);
  };

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
          <div className="relative h-[200px] sm:h-[260px]">
            {/* 背景图 */}
            <div className="absolute inset-0 bg-black/30">
              {userData.cover && (
                <div className="absolute inset-0">
                  <img
                    src={userData.cover}
                    alt="Background"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
            </div>

            {/* 内容区 */}
            <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-10">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16 lg:h-24 lg:w-24 border-4 border-background">
                    <AvatarImage src={userData.avatar_url || ""} />
                    <AvatarFallback>
                      {userData.username?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-white">
                    <div className="flex items-center space-x-2">
                      <h1 className="text-2xl font-semibold text-white">
                        {userData.username}
                      </h1>
                    </div>
                    <div className="text-white">
                      <span className="font-medium">@{userData.nickname} </span>
                      <span>加入于</span>
                      <span>
                        {userData.created_at
                          ? new Date(userData.created_at).toLocaleDateString(
                              "zh-CN",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )
                          : "未知"}
                      </span>
                    </div>
                  </div>
                </div>
                {isCurrentUser ? (
                  <Button size="sm" className="rounded-full primary" asChild>
                    <Link
                      href={`/u/${username}/settings?hashid=${userData.hashid}`}
                    >
                      修改个人信息
                    </Link>
                  </Button>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                      >
                        操作
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => {
                          setReportToKaterOpen(true);
                        }}
                      >
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        <span>向Kater檢舉</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => {
                          handleBlock(userData.hashid);
                        }}
                      >
                        {isBlocked ? (
                          <Unlock className="mr-2 h-4 w-4" />
                        ) : (
                          <Ban className="mr-2 h-4 w-4" />
                        )}
                        <span>{isBlocked ? "取消拉黑" : "拉黑"}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 内容区 */}
      <div className="mx-auto max-w-7xl overflow-hidden">{children}</div>

      {/* 向Kater举报对话框 */}
      <ReportDialog
        open={reportToKaterOpen}
        onOpenChange={setReportToKaterOpen}
        title="向Kater檢舉"
        form={{
          user_hashid: userData.hashid,
          board_id: 0,
          post_id: 0,
          reported_to: "moderator",
          target: 3, // 3 表示用户
        }}
      />
    </div>
  );
}
