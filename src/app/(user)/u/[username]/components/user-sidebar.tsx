"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

export type UserTabType = "replies" | "posts" | "history";
interface UserSidebarProps {
  username: string;
  activeTab: UserTabType;
  isOwner: boolean;
  stats: {
    replies: number;
    posts: number;
  };
}

export default function UserSidebar({
  username,
  activeTab,
  isOwner,
  stats,
}: UserSidebarProps) {
  const { data: user, isLoading } = useQuery({
    queryKey: ["user", username],
    queryFn: () => api.users.get({ username: username }),
    enabled: !!username,
  });

  const navItems: { label: string; href: UserTabType; count: number }[] = [
    { label: "回复", href: "replies", count: stats.replies },
    { label: "文章", href: "posts", count: stats.posts },
  ];

  if (isOwner) {
    navItems.push({
      label: "使用者名称历史",
      href: "history",
      count: user?.username_history?.length ?? 0,
    });
  }

  if (isLoading) {
    return (
      <div className="lg:w-60">
        <div className="mt-6 space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col items-center">
      <nav
        className={cn(
          // 基础样式（移动端）
          "flex overflow-x-auto border-b whitespace-nowrap scrollbar-none h-10 w-full",
          // 桌面端样式（大屏幕）
          "lg:flex-col lg:space-y-1 lg:space-x-0 lg:border-none lg:rounded-lg lg:px-2 lg:overflow-visible lg:whitespace-normal"
        )}
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.href;
          return (
            <Link
              key={item.href}
              href={`/u/${username}?tab=${item.href}`}
              className={cn(
                // 基础样式（移动端）
                "py-1 text-center text-sm font-medium transition-colors flex items-center justify-center",
                isActive
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-muted-foreground hover:text-gray-700",

                // 桌面端样式（大屏幕）
                "lg:w-auto lg:flex-auto lg:flex lg:items-center lg:justify-between lg:text-left lg:py-2 lg:px-4 lg:rounded-lg lg:border-b-0 lg:min-w-0",
                isActive
                  ? "lg:bg-blue-subtle lg:text-blue-600 lg:font-medium lg:border-none"
                  : "lg:hover:bg-subtle lg:text-muted-foreground"
              )}
            >
              <span className="px-4 lg:px-0">{item.label}</span>
              <span
                className={cn(
                  "hidden",
                  "lg:inline-block lg:text-xs lg:px-2 lg:rounded",
                  isActive ? "lg:text-blue-600" : "lg:text-muted-foreground"
                )}
              ></span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
