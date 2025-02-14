"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
              <div className="text-sm text-gray-500">{board.description}</div>
            </div>
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="text-sm text-gray-500"
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
  onUnblock,
}: {
  users: BlacklistUser[];
  onUnblock: (id: string) => void;
}) {
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
              <div className="text-sm text-gray-500">{user.description}</div>
            </div>
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="text-sm text-gray-500"
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

const mockUsers: BlacklistUser[] = [
  {
    id: "3",
    name: "用户名称用户名称用户名称",
    avatar: "/avatar.jpg",
    description: "@21821812u121",
  },
  {
    id: "4",
    name: "用户名称用户名称用户名称",
    avatar: "/avatar.jpg",
    description: "@21821812u121",
  },
  {
    id: "5",
    name: "用户名称用户名称用户名称",
    avatar: "/avatar.jpg",
    description: "@21821812u121",
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
  const [users, setUsers] = React.useState<BlacklistUser[]>(mockUsers);

  const handleUnblockBoard = (boardId: string) => {
    setBoards((prev) => prev.filter((board) => board.id !== boardId));
  };

  const handleUnblockUser = (userId: string) => {
    setUsers((prev) => prev.filter((user) => user.id !== userId));
  };

  return (
    <div className="space-y-4">
      {type === "board" ? (
        <Boards boards={boards} onUnblock={handleUnblockBoard} />
      ) : (
        <Users users={users} onUnblock={handleUnblockUser} />
      )}
    </div>
  );
}
