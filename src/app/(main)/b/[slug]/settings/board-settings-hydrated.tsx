"use client";

import React, { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Board } from "@/types";
import { api } from "@/lib/api";
import { BoardSettingsForm } from "./board-settings-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface BoardSettingsHydratedProps {
  slug: string;
  initialBoard: Board;
}

export function BoardSettingsHydrated({ 
  slug, 
  initialBoard 
}: BoardSettingsHydratedProps) {
  const queryClient = useQueryClient();

  // 使用服务端数据预填充 React Query 缓存
  useEffect(() => {
    queryClient.setQueryData(['board', slug], initialBoard);
  }, [queryClient, slug, initialBoard]);

  // 使用 React Query 管理 board 状态
  const { 
    data: board, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['board', slug],
    queryFn: () => api.boards.get({ slug }),
    initialData: initialBoard,
    // 可以设置缓存时间等选项
    staleTime: 30 * 1000, // 30秒内认为数据是新鲜的
    gcTime: 5 * 60 * 1000, // 5分钟后清理缓存
  });

  const handleSuccess = async (updatedBoard: Board) => {
    // 更新 React Query 缓存
    queryClient.setQueryData(['board', slug], updatedBoard);
    
    // 也可以选择重新获取数据以确保同步
    // await refetch();
    
    // 使相关查询失效
    queryClient.invalidateQueries({ 
      queryKey: ['boards'] // 看板列表
    });
    queryClient.invalidateQueries({ 
      queryKey: ['board', slug, 'members'] // 看板成员等相关数据
    });
  };

  if (isLoading) {
    return <BoardSettingsSkeleton />;
  }

  if (error) {
    return (
      <div className="pt-2">
        <div className="text-center py-8">
          <p className="text-red-500">加载失败，请重试</p>
          <button 
            onClick={() => refetch()}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  if (!board) {
    return null;
  }

  return (
    <div className="pt-2">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20 flex-shrink-0">
            <AvatarImage src={board.avatar} alt={board.name} />
            <AvatarFallback>{board.name[0].toUpperCase()}</AvatarFallback>
          </Avatar>
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

      <BoardSettingsForm board={board} onSuccess={handleSuccess} />
    </div>
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