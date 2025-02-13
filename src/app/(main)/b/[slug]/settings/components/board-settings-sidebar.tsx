"use client";

import { cn } from "@/lib/utils";
import React from "react";
import { Board } from "@/types";
import { Settings, Users2 } from "lucide-react";

interface BoardSettingsSidebarProps {
  board: Board;
  activeTab?: "general" | "rules" | "child-boards" | "approval" | "members" | "content" | "records" | "blocklist";
  onTabChange?: (tab: "general" | "rules" | "child-boards" | "approval" | "members" | "content" | "records" | "blocklist") => void;
  className?: string;
}

export default function BoardSettingsSidebar({ board, activeTab = "general", onTabChange, className }: BoardSettingsSidebarProps) {
  const handleTabClick = (e: React.MouseEvent<HTMLAnchorElement>, tab: typeof activeTab) => {
    e.preventDefault();
    onTabChange?.(tab);
  };

  return (
    <div className="flex flex-col gap-4 pb-12">
      <div className="flex items-center gap-2 px-4">
        <div className="w-6 h-6 flex items-center justify-center">
          <Settings className="w-5 h-5" />
        </div>
        <span className="text-lg font-semibold">全域設定</span>
      </div>
      <nav className="flex flex-col gap-1">
        <a
          href="#"
          onClick={(e) => handleTabClick(e, "general")}
          className={cn(
            "flex items-center w-full px-4 py-2 text-base rounded-lg transition-colors",
            activeTab === "general"
              ? "bg-accent text-accent-foreground"
              : "hover:bg-accent hover:text-accent-foreground"
          )}
        >
          一般設置
        </a>
      </nav>

      <div className="flex items-center gap-2 px-4">
        <div className="w-6 h-6 flex items-center justify-center">
          <Users2 className="w-5 h-5" />
        </div>
        <span className="text-lg font-semibold">看板管理</span>
      </div>
      <nav className="flex flex-col gap-1">
        <a
          href="#"
          onClick={(e) => handleTabClick(e, "child-boards")}
          className={cn(
            "flex items-center w-full px-4 py-2 text-base rounded-lg transition-colors",
            activeTab === "child-boards"
              ? "bg-accent text-accent-foreground"
              : "hover:bg-accent hover:text-accent-foreground"
          )}
        >
          子版設定
        </a>
        <a
          href="#"
          onClick={(e) => handleTabClick(e, "rules")}
          className={cn(
            "flex items-center w-full px-4 py-2 text-base rounded-lg transition-colors",
            activeTab === "rules"
              ? "bg-accent text-accent-foreground"
              : "hover:bg-accent hover:text-accent-foreground"
          )}
        >
          規則設置
        </a>
        <a
          href="#"
          onClick={(e) => handleTabClick(e, "approval")}
          className={cn(
            "flex items-center w-full px-4 py-2 text-base rounded-lg transition-colors",
            activeTab === "approval"
              ? "bg-accent text-accent-foreground"
              : "hover:bg-accent hover:text-accent-foreground"
          )}
        >
          成員審核
        </a>
        <a
          href="#"
          onClick={(e) => handleTabClick(e, "members")}
          className={cn(
            "flex items-center w-full px-4 py-2 text-base rounded-lg transition-colors",
            activeTab === "members"
              ? "bg-accent text-accent-foreground"
              : "hover:bg-accent hover:text-accent-foreground"
          )}
        >
          成員管理
        </a>
        <a
          href="#"
          onClick={(e) => handleTabClick(e, "content")}
          className={cn(
            "flex items-center w-full px-4 py-2 text-base rounded-lg transition-colors",
            activeTab === "content"
              ? "bg-accent text-accent-foreground"
              : "hover:bg-accent hover:text-accent-foreground"
          )}
        >
          榜單內容
        </a>
        <a
          href="#"
          onClick={(e) => handleTabClick(e, "records")}
          className={cn(
            "flex items-center w-full px-4 py-2 text-base rounded-lg transition-colors",
            activeTab === "records"
              ? "bg-accent text-accent-foreground"
              : "hover:bg-accent hover:text-accent-foreground"
          )}
        >
          審核記錄
        </a>
        <a
          href="#"
          onClick={(e) => handleTabClick(e, "blocklist")}
          className={cn(
            "flex items-center w-full px-4 py-2 text-base rounded-lg transition-colors",
            activeTab === "blocklist"
              ? "bg-accent text-accent-foreground"
              : "hover:bg-accent hover:text-accent-foreground"
          )}
        >
          封鎖名單
        </a>
      </nav>
    </div>
  );
}
