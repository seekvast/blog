"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { BoardSettingsForm } from "./board-settings-form";
import { api } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ROLE_PERMISSIONS } from "@/constants/board-permissions";
import { BoardPermission } from "@/constants/board-permissions";
import { Board } from "@/types";
import { useAuth } from "@/components/providers/auth-provider";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

export default function BoardSettingsPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { user } = useAuth();
  const { toast } = useToast();

  // 获取看板数据
  const {
    data: board,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["board", slug],
    queryFn: () => api.boards.get({ slug }),
    enabled: !!slug && !!user,
    retry: 1,
  });

  // 权限检查
  const hasPermission = () => {
    if (!board || !user) return false;

    const userRole = board.board_user?.user_role;
    if (
      !userRole ||
      !ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS]
    ) {
      return false;
    }

    return ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS].includes(
      BoardPermission.VISIT_SETTINGS
    );
  };

  // 处理更新成功
  const handleSuccess = (updatedBoard: Board) => {};

  // 错误处理
  if (error) {
    const apiError = error as any;
    if (apiError.status === 404) {
      notFound();
    }

    return (
      <div className="pt-2">
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">加载失败</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  // 加载状态
  if (isLoading || !board) {
    return <BoardSettingsSkeleton />;
  }

  // 权限检查
  if (!hasPermission()) {
    notFound();
  }

  return (
    <AuthGuard fallback={<div className="text-center py-8">请先登录</div>}>
      <div className="pt-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Link href={`/b/${board.slug}`}>
              <Avatar className="h-20 w-20 flex-shrink-0">
                <AvatarImage src={board.avatar} alt={board.name} />
                <AvatarFallback>{board.name[0].toUpperCase()}</AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{board.name}</h1>
              <div className="text-sm text-muted-foreground mt-1 flex items-center flex-wrap">
                <span>{board.visibility >= 1 ? "私密" : "公開"}</span>
                <span className="mx-1.5">·</span>
                <span>{board.users_count} 成員</span>
                {board.category && (
                  <>
                    <span className="mx-1.5">·</span>
                    <span>{board.category.name}</span>
                  </>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
                {board.desc}
              </p>
            </div>
          </div>
        </div>

        <hr className="my-4" />

        <BoardSettingsForm board={board} />
      </div>
    </AuthGuard>
  );
}

function BoardSettingsSkeleton() {
  return (
    <div className="pt-2">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </div>
      <hr className="my-4" />
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
}
