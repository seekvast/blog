"use client";

import { cn } from "@/lib/utils";
import React from "react";

export type UserTabType =
  | "replies"
  | "posts"
  | "history";

interface UserSidebarProps {
  activeTab: UserTabType;
  onTabChange: (tab: UserTabType) => void;
  navItems: Array<{
    label: string;
    count: number;
    href: UserTabType;
  }>;
  showCounts?: boolean;
}

export default function UserSidebar({
  activeTab,
  onTabChange,
  navItems,
  showCounts = true,
}: UserSidebarProps) {
  const handleTabClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    tab: UserTabType
  ) => {
    e.preventDefault();
    onTabChange(tab);
  };

  return (
    <nav
      className={cn(
        // 基础样式（移动端）
        "flex overflow-x-auto border-b whitespace-nowrap scrollbar-none h-10",
        // 桌面端样式（大屏幕）
        "lg:flex-col lg:space-y-1 lg:space-x-0 lg:border-none lg:rounded-lg lg:px-2 lg:overflow-visible lg:whitespace-normal"
      )}
    >
      {navItems.map((item) => {
        const isActive = activeTab === item.href;
        return (
          <a
            key={item.href}
            href="#"
            onClick={(e) => handleTabClick(e, item.href)}
            className={cn(
              // 基础样式（移动端）
              "py-1 text-center text-sm font-medium transition-colors flex items-center justify-center",
              isActive
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700",

              // 桌面端样式（大屏幕）
              "lg:w-auto lg:flex-auto lg:flex lg:items-center lg:justify-between lg:text-left lg:py-2 lg:px-4 lg:rounded-lg lg:border-b-0 lg:min-w-0",
              isActive
                ? "lg:bg-blue-subtle lg:text-blue-600 lg:font-medium lg:border-none"
                : "lg:hover:bg-subtle lg:text-gray-500"
            )}
          >
            <span className="px-4 lg:px-0">{item.label}</span>
            {showCounts && (
              <span
                className={cn(
                  // 移动端样式（默认隐藏计数）
                  "hidden",
                  // 桌面端样式（显示计数）
                  "lg:inline-block lg:text-xs lg:px-2 lg:rounded",
                  isActive ? "lg:text-blue-600" : "lg:text-gray-500"
                )}
              >
                {/* {item.count} */}
              </span>
            )}
          </a>
        );
      })}
    </nav>
  );
}
