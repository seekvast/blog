"use client";

import { cn } from "@/lib/utils";
import React from "react";
import { Board } from "@/types";
import { Settings, Users2 } from "lucide-react";

interface BoardSettingsSidebarProps {
  board: Board;
  activeTab?:
    | "general"
    | "rules"
    | "child-boards"
    | "approval"
    | "members"
    | "content"
    | "records"
    | "blocklist";
  onTabChange?: (
    tab:
      | "general"
      | "rules"
      | "child-boards"
      | "approval"
      | "members"
      | "content"
      | "records"
      | "blocklist"
  ) => void;
  className?: string;
}

export default function BoardSettingsSidebar({
  board,
  activeTab = "general",
  onTabChange,
  className,
}: BoardSettingsSidebarProps) {
  const handleTabClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    tab: typeof activeTab
  ) => {
    e.preventDefault();
    onTabChange?.(tab);
  };

  return (
    <div className={cn("space-y-4 rounded-lg", className)}>
      {/* 全域设定组 */}
      <div>
        <div className="flex items-center gap-2 pb-4">
          <Settings className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-500">全域設定</span>
        </div>
        <nav className="space-y-1">
          <a
            href="#"
            onClick={(e) => handleTabClick(e, "general")}
            className={cn(
              "flex items-center p-2 text-sm rounded-lg transition-colors",
              activeTab === "general"
                ? "bg-blue-50 text-blue-600 font-medium"
                : "text-gray-600 hover:bg-gray-50"
            )}
          >
            一般設置
          </a>
        </nav>
      </div>

      {/* 看板管理组 */}
      <div>
        <div className="flex items-center gap-2 px-4 py-2">
          <Users2 className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-500">看板管理</span>
        </div>
        <nav className="space-y-1">
          <a
            href="#"
            onClick={(e) => handleTabClick(e, "child-boards")}
            className={cn(
              "flex items-center px-4 py-2 text-sm rounded-lg transition-colors",
              activeTab === "child-boards"
                ? "bg-blue-50 text-blue-600 font-medium"
                : "text-gray-600 hover:bg-gray-50"
            )}
          >
            子版設定
          </a>
          <a
            href="#"
            onClick={(e) => handleTabClick(e, "rules")}
            className={cn(
              "flex items-center px-4 py-2 text-sm rounded-lg transition-colors",
              activeTab === "rules"
                ? "bg-blue-50 text-blue-600 font-medium"
                : "text-gray-600 hover:bg-gray-50"
            )}
          >
            規則設置
          </a>
          <a
            href="#"
            onClick={(e) => handleTabClick(e, "approval")}
            className={cn(
              "flex items-center px-4 py-2 text-sm rounded-lg transition-colors",
              activeTab === "approval"
                ? "bg-blue-50 text-blue-600 font-medium"
                : "text-gray-600 hover:bg-gray-50"
            )}
          >
            成員審核
          </a>
          <a
            href="#"
            onClick={(e) => handleTabClick(e, "members")}
            className={cn(
              "flex items-center px-4 py-2 text-sm rounded-lg transition-colors",
              activeTab === "members"
                ? "bg-blue-50 text-blue-600 font-medium"
                : "text-gray-600 hover:bg-gray-50"
            )}
          >
            成員管理
          </a>
          <a
            href="#"
            onClick={(e) => handleTabClick(e, "content")}
            className={cn(
              "flex items-center px-4 py-2 text-sm rounded-lg transition-colors",
              activeTab === "content"
                ? "bg-blue-50 text-blue-600 font-medium"
                : "text-gray-600 hover:bg-gray-50"
            )}
          >
            內容管理
          </a>
          <a
            href="#"
            onClick={(e) => handleTabClick(e, "records")}
            className={cn(
              "flex items-center px-4 py-2 text-sm rounded-lg transition-colors",
              activeTab === "records"
                ? "bg-blue-50 text-blue-600 font-medium"
                : "text-gray-600 hover:bg-gray-50"
            )}
          >
            違規記錄
          </a>
          <a
            href="#"
            onClick={(e) => handleTabClick(e, "blocklist")}
            className={cn(
              "flex items-center px-4 py-2 text-sm rounded-lg transition-colors",
              activeTab === "blocklist"
                ? "bg-blue-50 text-blue-600 font-medium"
                : "text-gray-600 hover:bg-gray-50"
            )}
          >
            黑名單
          </a>
        </nav>
      </div>
    </div>
  );
}
