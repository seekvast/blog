"use client";

import { cn } from "@/lib/utils";
import React from "react";

export type UserTabType = "replies" | "posts" | "following" | "violation" |"history";

interface UserSidebarProps {
  activeTab: UserTabType;
  onTabChange: (tab: UserTabType) => void;
  navItems: Array<{
    label: string;
    count: number;
    href: UserTabType;
  }>;
}

export default function UserSidebar({ activeTab, onTabChange, navItems }: UserSidebarProps) {
  const handleTabClick = (e: React.MouseEvent<HTMLAnchorElement>, tab: UserTabType) => {
    e.preventDefault();
    onTabChange(tab);
  };

  return (
    <nav className="space-y-1 rounded-lg p-2">
      {navItems.map((item) => {
        const isActive = activeTab === item.href;
        return (
          <a
            key={item.href}
            href="#"
            onClick={(e) => handleTabClick(e, item.href)}
            className={cn(
              "flex items-center justify-between px-4 py-2 text-sm rounded-lg transition-colors",
              isActive
                ? "bg-blue-50 text-blue-600 font-medium"
                : "text-gray-600 hover:bg-gray-50"
            )}
          >
            <span>{item.label}</span>
            <span className={cn(
              "text-xs px-2 rounded",
              isActive ? "text-blue-600" : "text-gray-500"
            )}>{item.count}</span>
          </a>
        );
      })}
    </nav>
  );
}
