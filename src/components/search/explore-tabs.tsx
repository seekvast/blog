"use client";

import * as React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  type DisplayMode,
  type SortBy,
  DiscussionControls,
} from "@/components/discussion/discussion-controls";

const tabs = [
  { id: "all", name: "相关", path: "/explore" },
  { id: "discussion", name: "文章", path: "/explore/discussions" },
  { id: "board", name: "看板", path: "/explore/boards" },
  { id: "user", name: "用户", path: "/explore/users" },
] as const;

interface ExploreTabsProps {
  displayMode?: DisplayMode;
  setDisplayMode?: (mode: DisplayMode) => void;
  sortBy?: SortBy;
  setSortBy?: (sort: SortBy) => void;
  showControls?: boolean;
}

export function ExploreTabs({
  displayMode = "grid",
  setDisplayMode = () => {},
  sortBy = "hot",
  setSortBy = () => {},
  showControls = false,
}: ExploreTabsProps) {
  const router = useRouter();
  const pathname = usePathname() || "";
  const searchParams = useSearchParams();
  const q = searchParams?.get("q") ?? "";

  // 根据当前路径确定激活的标签
  const getActiveTab = () => {
    if (pathname === "/explore") return "all";
    if (pathname.includes("/discussions")) return "discussion";
    if (pathname.includes("/boards")) return "board";
    if (pathname.includes("/users")) return "user";
    return "all";
  };

  const activeTab = getActiveTab();

  return (
    <div className="flex justify-between items-center lg:border-b">
      <div className="flex items-center">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              router.push(`${tab.path}?q=${q}`);
            }}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {showControls && (
        <DiscussionControls
          displayMode={displayMode}
          setDisplayMode={setDisplayMode}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
      )}
    </div>
  );
}
