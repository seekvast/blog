"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface BlacklistUser {
  id: string;
  name: string;
  avatar?: string;
  title: string;
  isNsfw?: boolean;
  description: string;
}

interface UserBlacklistProps {
  users?: BlacklistUser[];
}

export function UserBlacklist({ users = [] }: UserBlacklistProps) {
  // 模拟数据
  const mockUsers: BlacklistUser[] = [
    {
      id: "1",
      name: "看板名称",
      title: "私密・8.99成员・首尔",
      description: "这是简介这是简介这是简介这是简介这是简介这是简介这是简介这是简介这是简介这是简介...",
      isNsfw: true
    },
    {
      id: "2",
      name: "看板名称",
      title: "私密・8.99成员・首尔",
      description: "这是简介这是简介这是简介这是简介这是简介这是简介这是简介这是简介这是简介这是简介...",
      isNsfw: true
    }
  ];

  const blacklistUsers = users.length > 0 ? users : mockUsers;

  return (
    <div className="space-y-4">
      {blacklistUsers.map((user) => (
        <div key={user.id} className="bg-white rounded-lg">
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                {/* 头像 */}
                <Avatar className="w-12 h-12 flex-shrink-0">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>

                {/* 用户信息 */}
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{user.name}</span>
                    {user.isNsfw && (
                      <span className="px-1.5 py-0.5 text-xs text-red-600 bg-red-50 rounded flex-shrink-0">
                        成人
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">{user.title}</div>
                  <div className="text-sm text-gray-500 truncate">{user.description}</div>
                </div>
              </div>

              {/* 解除封禁按钮 */}
              <Button
                variant="ghost"
                size="sm"
                className="text-sm text-gray-500 hover:text-gray-900 flex-shrink-0"
              >
                解除封禁
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
