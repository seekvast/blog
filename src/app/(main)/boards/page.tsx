"use client";

import * as React from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";

const BOARDS = [
  {
    id: 1,
    name: "色图交流",
    avatar: "/avatar.jpg",
    type: "成人",
    members: "99",
    description:
      "这是简介这是简介这是简介这是简介这是简介这是简介这是简介这是简介这是简介这是简介这是简介...",
    joined: false,
  },
  {
    id: 2,
    name: "色图交流",
    avatar: "/avatar.jpg",
    type: "成人",
    members: "99",
    description:
      "这是简介这是简介这是简介这是简介这是简介这是简介这是简介这是简介这是简介这是简介这是简介...",
    joined: false,
  },
  {
    id: 3,
    name: "色图交流",
    avatar: "/avatar.jpg",
    members: "99",
    description:
      "这是简介这是简介这是简介这是简介这是简介这是简介这是简介这是简介这是简介这是简介这是简介...",
    joined: false,
  },
  {
    id: 4,
    name: "色图交流",
    avatar: "/avatar.jpg",
    type: "成人",
    members: "99",
    description:
      "这是简介这是简介这是简介这是简介这是简介这是简介这是简介这是简介这是简介这是简介这是简介...",
    joined: false,
  },
  {
    id: 5,
    name: "色图交流",
    avatar: "/avatar.jpg",
    type: "成人",
    members: "99",
    description:
      "这是简介这是简介这是简介这是简介这是简介这是简介这是简介这是简介这是简介这是简介这是简介...",
    joined: false,
  },
  {
    id: 6,
    name: "色图交流",
    avatar: "/avatar.jpg",
    type: "成人",
    members: "99",
    description:
      "这是简介这是简介这是简介这是简介这是简介这是简介这是简介这是简介这是简介这是简介这是简介...",
    joined: false,
  },
  {
    id: 7,
    name: "色图交流",
    avatar: "/avatar.jpg",
    type: "成人",
    members: "99",
    description:
      "这是简介这是简介这是简介这是简介这是简介这是简介这是简介这是简介这是简介这是简介这是简介...",
    joined: false,
  },
];

export default function BoardsPage() {
  return (
    <div className="flex flex-col">
      {/* 顶部导航 */}
      <div className="bg-white">
        <div className="mx-auto w-[808px] px-8">
          <div className="flex h-[60px] items-center justify-between border-b border-[#EAEAEA]">
            <div className="flex items-center space-x-8">
              <Button
                variant="ghost"
                className="h-8 px-1 font-medium text-primary hover:bg-transparent hover:text-primary"
              >
                推薦
              </Button>
              <Button
                variant="ghost"
                className="h-8 px-1 font-medium text-muted-foreground hover:bg-transparent hover:text-foreground"
              >
                已加入
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 space-x-2 text-muted-foreground hover:bg-transparent hover:text-foreground"
            >
              全部
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 看板列表 */}
      <div className="mx-auto w-[808px] px-8">
        <div className="divide-y">
          {BOARDS.map((board) => (
            <div
              key={board.id}
              className="flex items-center justify-between py-4"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <Avatar className="h-12 w-12 rounded-lg">
                  <AvatarImage src={board.avatar} alt={board.name} />
                  <AvatarFallback>{board.name[0]}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium truncate">{board.name}</span>
                    {board.type && (
                      <Badge
                        variant="secondary"
                        className="bg-red-50 text-red-600 shrink-0"
                      >
                        {board.type}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-user"
                      >
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <span>{board.members}</span>
                    </div>
                  </div>
                  {board.description && (
                    <div className="mt-1 text-sm text-muted-foreground truncate">
                      {board.description}
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="default"
                size="sm"
                className="w-24 shrink-0 ml-4"
              >
                加入
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
