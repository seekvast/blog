"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { NotificationTabType } from "./notification-preview";

const navItems = [
  { label: "全部通知", type: "all" },
  { label: "回复我的", type: "replies" },
  { label: "@我的", type: "mentions" },
  { label: "收到的赞", type: "likes" },
  { label: "系统消息", type: "system" },
];

interface NotificationDesktopNavProps {
  activeType: NotificationTabType;
  onTypeChange: (type: NotificationTabType) => void;
}

export function NotificationDesktopNav({
  activeType,
  onTypeChange,
}: NotificationDesktopNavProps) {
  const handleClick = (e: React.MouseEvent, type: string) => {
    e.preventDefault();
    if (onTypeChange && type) {
      onTypeChange(type as NotificationTabType);
    }
  };

  return (
    <div className="hidden lg:block py-4 w-60 flex-shrink-0">
      <nav className="flex-col space-y-1 space-x-0 border-none rounded-lg px-2 overflow-visible whitespace-normal">
        {navItems.map((item) => (
          <button
            key={item.type}
            onClick={(e) => handleClick(e, item.type)}
            className={cn(
              "w-full flex-auto flex items-center justify-between text-left py-1 px-4 rounded-lg border-b-0 min-w-0",
              activeType === item.type
                ? "bg-blue-50 text-blue-600 font-medium border-none"
                : "text-gray-500"
            )}
          >
            <span className="px-0">{item.label}</span>
            <span
              className={cn(
                "inline-block text-xs px-2 rounded",
                activeType === item.type ? "text-blue-600" : "text-gray-500"
              )}
            >
              {/* {0} */}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}

interface NotificationMobileNavProps {
  activeType: NotificationTabType;
  onTypeChange: (type: NotificationTabType) => void;
}

export function NotificationMobileNav({
  activeType,
  onTypeChange,
}: NotificationMobileNavProps) {
  return (
    <div className="lg:hidden">
      <nav className="flex overflow-x-auto border-b whitespace-nowrap scrollbar-none h-10">
        {navItems.map((item) => (
          <button
            key={item.type}
            className={cn(
              "py-1 px-4 text-center text-sm font-medium transition-colors",
              activeType === item.type
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            )}
            onClick={() => onTypeChange(item.type as NotificationTabType)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
