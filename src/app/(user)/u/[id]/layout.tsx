"use client";

import { useParams, usePathname, useSearchParams } from "next/navigation";
import NotFound from "@/app/not-found";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Ban, Unlock } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import { ReportDialog } from "@/components/report/report-dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReportTarget } from "@/constants/report-target";
import { fromNow } from "@/lib/dayjs";

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
  const [gradientColor, setGradientColor] =
    useState<string>("rgba(0, 0, 0, 0)");

  // 获取用户详细信息
  const { data: userData, isError, error, status } = useQuery({
    queryKey: ["user", hashid],
    queryFn: () => api.users.get({ hashid: hashid }),
    enabled: !!hashid,
  });
  
  // 判断是否显示404页面
  const notFound = (status === 'error' || (status === 'success' && !userData)) && !!hashid;
  const isCurrentUser = session?.user?.hashid === userData?.hashid;
  // 使用 useEffect 处理 blocked 状态
  useEffect(() => {
    if (userData?.blocked) {
      setIsBlocked(true);
    }
  }, [userData?.blocked]);

  // 提取图片颜色
  useEffect(() => {
    const avatarUrl = userData?.avatar_url;
    if (userData?.cover) {
      setGradientColor(`rgba(0, 0, 0, 0.5)`);
      return;
    }
    if (avatarUrl && typeof avatarUrl === "string") {
      const getImageColor = async () => {
        try {
          const img = document.createElement("img");
          img.src = `/api/proxy-image?url=${encodeURIComponent(avatarUrl)}`;

          img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(
              0,
              0,
              canvas.width,
              canvas.height
            );
            const data = imageData.data;

            let r = 0,
              g = 0,
              b = 0;
            for (let i = 0; i < data.length; i += 4) {
              r += data[i];
              g += data[i + 1];
              b += data[i + 2];
            }

            const count = data.length / 4;
            r = Math.round(r / count);
            g = Math.round(g / count);
            b = Math.round(b / count);

            setGradientColor(`rgba(${r}, ${g}, ${b}, 0.5)`);
          };

          img.onerror = () => {
            console.error("Error loading image");
            setGradientColor("rgba(0, 0, 0, 0)");
          };
        } catch (error) {
          console.error("Error getting color:", error);
          setGradientColor("rgba(0, 0, 0, 0)");
        }
      };
      getImageColor();
    }
  }, [userData?.avatar_url]);

  // 拉黑用户
  const blockMutation = useMutation({
    mutationFn: (block_user_hashid: string) =>
      api.users.block({ block_user_hashid }),
    onSuccess: (response) => {
      setIsBlocked(!isBlocked);
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

  if (notFound) {
    return <NotFound />;
  }
  
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
              <div
                className="absolute inset-0 transition-colors duration-300"
                style={{
                  backgroundColor: gradientColor,
                }}
              />
            </div>

            {/* 内容区 */}
            <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-10">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16 lg:h-24 lg:w-24 border-4 border-background">
                    <AvatarImage src={userData.avatar_url || ""} />
                    <AvatarFallback>
                      {userData.nickname?.[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-white">
                    <div className="flex items-center space-x-2">
                      <h1 className="text-2xl font-semibold text-white">
                        {userData.nickname}
                      </h1>
                    </div>
                    <div className="flex  space-x-2 text-white text-sm">
                      <span>@{userData.username} </span>
                      {userData.preferences?.discloseOnline === "yes" &&
                      userData.is_online ? (
                        <div className="flex items-center space-x-1">
                          <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                          <span>在线上</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1">
                          <span>{fromNow(userData?.last_seen_at || "")}</span>
                        </div>
                      )}
                      <div>
                        <span>加入于</span>{" "}
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
                      <button className="rounded-full px-4 py-2 bg-gray-500">
                        <ChevronDown className="h-4 w-4 text-white" />
                      </button>
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
          reported_to: "admin",
          target: ReportTarget.USER,
        }}
      />
    </div>
  );
}
