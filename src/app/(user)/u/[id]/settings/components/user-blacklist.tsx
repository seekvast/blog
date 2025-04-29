"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { UserBlacklist as UserBlacklistType } from "@/types/user";
import { Pagination } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

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
  onUnblock,
}: {
  boards: BlacklistBoard[];
  onUnblock: (id: string) => void;
}) {
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
              <AvatarFallback>{board.name[0]}</AvatarFallback>
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
              <AvatarFallback>{user.name[0]}</AvatarFallback>
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

// 模拟数据
const mockBoards: BlacklistBoard[] = [
  {
    id: "1",
    name: "看板名称",
    avatar: "/avatar.jpg",
    description: "私密・&99成员・音乐",
  },
  {
    id: "2",
    name: "看板名称",
    avatar: "/avatar.jpg",
    description: "私密・&99成员・音乐",
  },
];

interface UserBlacklistProps {
  type: "board" | "user";
  onTypeChange: (type: "board" | "user") => void;
}

// 主黑名单组件
export default function UserBlacklist({
  type,
  onTypeChange,
}: UserBlacklistProps) {
  const [boards, setBoards] = React.useState<BlacklistBoard[]>(mockBoards);

  // 使用 React Query 获取用户黑名单数据
  const { data, isLoading, isError, refetch } = useQuery<
    Pagination<UserBlacklistType>
  >({
    queryKey: ["userBlacklist"],
    queryFn: () => api.users.getBlacklist(),
  });

  // 将 API 返回的数据转换为组件所需的格式
  const users = React.useMemo(() => {
    if (!data?.items) return [];

    return data.items.map((item) => ({
      id: item.blocked_hashid,
      name: item.blocked.nickname || item.blocked.username,
      avatar: item.blocked.avatar_url || "/avatar.jpg",
      description: `@${item.blocked.username}`,
    }));
  }, [data]);

  const handleUnblockBoard = (boardId: string) => {
    setBoards((prev) => prev.filter((board) => board.id !== boardId));
  };

  const handleUnblockUser = async (userId: string) => {
    try {
      await api.users.block({ block_user_hashid: userId, action: "unblock" });
      refetch();
    } catch (error) {
      console.error("解除黑名单失败", error);
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
      {type === "board" ? (
        <Boards boards={boards} onUnblock={handleUnblockBoard} />
      ) : (
        <Users
          users={users}
          isLoading={isLoading}
          onUnblock={handleUnblockUser}
        />
      )}
    </div>
  );
}
