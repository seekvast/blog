"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { BlacklistItem } from "@/types/user";
import { Pagination } from "@/types/common";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "@/types/user";
import { Board } from "@/types/board";

interface UserBlacklistProps {
  type: "board" | "user";
}

// 看板黑名单列表组件
function Boards({
  boards,
  isLoading,
  onUnblock,
}: {
  boards: Array<{
    id: string;
    name: string;
    avatar: string;
    description: string;
  }>;
  isLoading: boolean;
  onUnblock: (id: string) => void;
}) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between py-3 border-b"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div>
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (boards.length === 0) {
    return (
      <div className="py-4 text-center text-muted-foreground">暂无数据</div>
    );
  }

  return (
    <div className="space-y-4">
      {boards.map((board) => (
        <div
          key={board.id}
          className="flex items-center justify-between py-3 border-b"
        >
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 flex-shrink-0">
              <AvatarImage src={board.avatar} />
              <AvatarFallback>{board.name[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{board.name}</div>
              <div className="text-sm text-muted-foreground">
                {board.description}
              </div>
            </div>
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="text-sm text-muted-foreground"
            onClick={() => onUnblock(board.id)}
          >
            解除封锁
          </Button>
        </div>
      ))}
    </div>
  );
}

// 用户黑名单列表组件
function Users({
  users,
  isLoading,
  onUnblock,
}: {
  users: Array<{
    id: string;
    name: string;
    avatar: string;
    description: string;
  }>;
  isLoading: boolean;
  onUnblock: (id: string) => void;
}) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between py-3 border-b"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div>
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="py-4 text-center text-muted-foreground">暂无数据</div>
    );
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <div
          key={user.id}
          className="flex items-center justify-between py-3 border-b"
        >
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 flex-shrink-0">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-muted-foreground">
                {user.description}
              </div>
            </div>
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="text-sm text-muted-foreground"
            onClick={() => onUnblock(user.id)}
          >
            解除封锁
          </Button>
        </div>
      ))}
    </div>
  );
}

// 主黑名单组件
export default function UserBlacklist({ type }: UserBlacklistProps) {
  const { data, isLoading, isError, refetch } = useQuery<
    Pagination<BlacklistItem>
  >({
    queryKey: ["userBlacklist", type],
    queryFn: () => api.users.getBlacklist({ blocked_type: type }),
  });

  const users = React.useMemo(() => {
    if (!data?.items) return [];
    return data.items
      .filter((item) => item.blockable_type === "App\\Models\\User")
      .map((item) => {
        return {
          id: item.blockable_hashid,
          name:
            (item.blockable as User).nickname ||
            (item.blockable as User).username,
          avatar: (item.blockable as User).avatar_url || "/avatar.jpg",
          description: `@${(item.blockable as User).username}`,
        };
      });
  }, [data]);

  const boards = React.useMemo(() => {
    if (!data?.items) return [];
    return data.items
      .filter((item) => item.blockable_type === "App\\Models\\Board")
      .map((item) => {
        return {
          id: item.blockable_hashid,
          name: (item.blockable as Board).name,
          avatar: (item.blockable as Board).avatar || "/board-avatar.jpg",
          description: (item.blockable as Board).desc || "",
        };
      });
  }, [data]);
  const handleUnblockBoard = async (boardSlug: string) => {
    try {
      await api.users.unblock({
        blockable_hashid: boardSlug,
        blockable_type: "board",
      });
      refetch();
    } catch (error) {
      console.error("解除看板黑名单失败", error);
    }
  };

  const handleUnblockUser = async (userId: string) => {
    try {
      await api.users.unblock({
        blockable_hashid: userId,
        blockable_type: "user",
      });
      refetch();
    } catch (error) {
      console.error("解除用户黑名单失败", error);
    }
  };

  if (isError) {
    return (
      <div className="py-4 text-center text-red-500">
        获取数据失败，请稍后重试
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {type === "user" ? (
        <Users
          users={users}
          isLoading={isLoading}
          onUnblock={handleUnblockUser}
        />
      ) : (
        <Boards
          boards={boards}
          isLoading={isLoading}
          onUnblock={handleUnblockBoard}
        />
      )}
    </div>
  );
}
