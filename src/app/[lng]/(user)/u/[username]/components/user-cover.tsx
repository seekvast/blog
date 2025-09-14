"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Ban, ChevronDown, Unlock } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReportDialog } from "@/components/report/report-dialog";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { fromNow } from "@/lib/dayjs";
import { ReportTarget } from "@/constants/report-target";
import type { User } from "@/types/user";

// 接收来自服务器的初始用户数据
interface UserCoverProps {
  initialUser: User;
}

export function UserCover({ initialUser }: UserCoverProps) {
  const params = useParams();
  const pathname = usePathname();
  const username = params?.username as string;
  const isSettingsPage = pathname?.includes(`/u/${username}/settings`) ?? false;

  const { data: session } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { requireAuthAndEmailVerification } = useRequireAuth();

  const [userData] = useState(initialUser);
  const [reportToKaterOpen, setReportToKaterOpen] = useState(false);
  const [isBlocked, setIsBlocked] = useState(!!initialUser.blocked);
  const [gradientColor, setGradientColor] = useState("rgba(0, 0, 0, 0)");

  // 关键修正：这是你原来 layout.tsx 中的颜色提取逻辑，现在它在这里。
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
          // 注意：确保你的 API 路由 /api/proxy-image 存在且能正常工作
          img.crossOrigin = "Anonymous"; // 跨域请求需要这个
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
            console.error("Error loading image for color extraction");
            setGradientColor("rgba(0, 0, 0, 0.5)");
          };
        } catch (error) {
          console.error("Error getting color:", error);
          setGradientColor("rgba(0, 0, 0, 0.5)");
        }
      };
      getImageColor();
    }
  }, [userData?.avatar_url, userData?.cover]);

  const blockMutation = useMutation({
    mutationFn: (block_user_hashid: string) =>
      api.users.block({ block_user_hashid }),
    onSuccess: () => {
      setIsBlocked((prev) => !prev);
      queryClient.invalidateQueries({ queryKey: ["user", username] });
      toast({ title: isBlocked ? "已取消拉黑" : "已拉黑" });
    },
    onError: (error) =>
      toast({ title: "操作失败", description: error.message }),
  });

  const handleBlock = (block_user_hashid: string) => {
    requireAuthAndEmailVerification(() =>
      blockMutation.mutate(block_user_hashid)
    );
  };

  const isCurrentUser = session?.user?.hashid === userData?.hashid;

  if (isSettingsPage) {
    return null;
  }

  return (
    <div className="w-full bg-muted/30">
      <div className="relative h-[200px] sm:h-[260px]">
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
            style={{ backgroundColor: gradientColor }}
          />
        </div>

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
                <h1 className="text-2xl font-semibold">{userData.nickname}</h1>
                <div className="flex flex-wrap md:space-x-2 text-white text-sm">
                  <span>@{userData.username}</span>
                  {/* 在线状态 */}
                  {userData.preferences?.discloseOnline === "yes" &&
                  userData.is_online ? (
                    <div className="flex items-center space-x-1">
                      <span>•</span>
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                      <span>在线上</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1">
                      <span>•</span>
                      <span>{fromNow(userData?.last_seen_at || "")}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <span>•</span>
                    <span>
                      加入于{" "}
                      {new Date(userData.created_at || "").toLocaleDateString(
                        "zh-CN",
                        { year: "numeric", month: "long" }
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {isCurrentUser ? (
              <Button size="sm" className="rounded-full" asChild>
                <Link href={`/u/${username}/settings`}>修改个人信息</Link>
              </Button>
            ) : (
              <div className="flex items-center space-x-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="rounded-full p-2 bg-black/15 hover:bg-black/30">
                      <ChevronDown className="h-4 w-4 text-white" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() =>
                        requireAuthAndEmailVerification(() =>
                          setReportToKaterOpen(true)
                        )
                      }
                    >
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      <span>向Kater檢舉</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => handleBlock(userData.hashid)}
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
              </div>
            )}
          </div>
        </div>
      </div>
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
