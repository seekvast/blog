"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { UserBlacklist as UserBlacklistType, User, Board } from "@/types/user";
import { Pagination } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// 看板黑名单数据接口
interface BlacklistBoard {
  id: string;
  name: string;
  avatar: string;
  description: string;
}

// 用户黑名单数据接口
interface BlacklistUser {
  id: string;
  name: string;
  avatar: string;
  description: string;
}

// 看板黑名单列表组件
function Boards({
  boards,
  isLoading,
  onUnblock,
}: {
  boards: BlacklistBoard[];
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
  users: BlacklistUser[];
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

interface UserBlacklistProps {
  type?: "board" | "user";
  onTypeChange?: (type: "board" | "user") => void;
}

// 主黑名单组件
export default function UserBlacklist({
  type: externalType,
  onTypeChange,
}: UserBlacklistProps) {
  // 内部状态管理，如果没有外部传入则使用内部状态
  const [internalType, setInternalType] = React.useState<"board" | "user">(
    "user"
  );
  const type = externalType || internalType;

  const handleTypeChange = (newType: "board" | "user") => {
    if (onTypeChange) {
      onTypeChange(newType);
    } else {
      setInternalType(newType);
    }
  };

  // 使用 React Query 获取黑名单数据，根据类型传递参数
  const { data, isLoading, isError, refetch } = useQuery<
    Pagination<UserBlacklistType>
  >({
    queryKey: ["userBlacklist", type],
    queryFn: () => api.users.getBlacklist({ blocked_type: type }),
  });

  // 将 API 返回的数据转换为用户黑名单格式
  const users = React.useMemo(() => {
    if (!data?.items) return [];

    return data.items.map((item) => ({
      id: item.blocked_hashid,
      name: item.blocked.nickname || item.blocked.username,
      avatar: item.blocked.avatar_url || "/avatar.jpg",
      description: `@${item.blocked.username}`,
    }));
  }, [data]);

  // 将 API 返回的数据转换为看板黑名单格式
  // 注意：当前API只返回用户黑名单，看板黑名单暂时使用空数组
  const boards = React.useMemo(() => {
    if (!data?.items) return [];

    // 如果API支持看板黑名单，这里会处理看板数据
    // 目前API只返回用户黑名单，所以看板列表为空
    return [];
  }, [data]);

  const handleUnblockBoard = async (boardId: string) => {
    try {
      await api.users.block({
        block_user_hashid: boardId,
        action: "unblock",
        blocked_type: "board",
      });
      refetch();
    } catch (error) {
      console.error("解除看板黑名单失败", error);
    }
  };

  const handleUnblockUser = async (userId: string) => {
    try {
      await api.users.block({
        block_user_hashid: userId,
        action: "unblock",
        blocked_type: "user",
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
      {/* 切换控件 */}
      <Tabs value={type} onValueChange={handleTypeChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="user">用户黑名单</TabsTrigger>
          <TabsTrigger value="board">看板黑名单</TabsTrigger>
        </TabsList>

        <TabsContent value="user" className="mt-4">
          <Users
            users={users}
            isLoading={isLoading}
            onUnblock={handleUnblockUser}
          />
        </TabsContent>

        <TabsContent value="board" className="mt-4">
          <Boards
            boards={boards}
            isLoading={isLoading}
            onUnblock={handleUnblockBoard}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
