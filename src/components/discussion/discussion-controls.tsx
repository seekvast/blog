"use client";

import * as React from "react";
import { LayoutGrid, List, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDiscussionDisplayStore } from "@/store/discussion-display-store";
import { DisplayMode, SortBy } from "@/types/display-preferences";
import { syncDiscussionPreferencesToCookie } from "@/lib/discussion-preferences";

interface DiscussionControlsProps {
  sortBy?: SortBy;
  setSortBy?: (sort: SortBy) => void;
  className?: string;
  pageId?: string;
}

export function DiscussionControls({
  sortBy: externalSortBy,
  setSortBy: externalSetSortBy,
  className,
  pageId,
}: DiscussionControlsProps) {
  const {
    getDisplayMode,
    setDisplayMode,
    getSortBy,
    setSortBy: storeSetSortBy,
  } = useDiscussionDisplayStore();

  const displayMode = getDisplayMode(pageId);

  const sortBy = externalSortBy ?? getSortBy(pageId);
  
  // 检查是否是讨论页面（需要同步Cookie）
  const isDiscussionPage = React.useMemo(() => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname;
    return path === '/' || path === '/following' || path === '/bookmarked';
  }, []);
  
  const setSortBy = externalSetSortBy ?? ((sort: SortBy) => {
    storeSetSortBy(sort, pageId);
    // 如果是讨论页面，同步到Cookie
    if (isDiscussionPage) {
      syncDiscussionPreferencesToCookie({ sort });
    }
  });

  const sortOptions = {
    hot: "热门",
    create: "最新发表",
    reply: "最后回复",
  };

  return (
    <div className={cn("flex items-center space-x-3", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="inline-flex items-center space-x-1 font-medium text-muted-foreground cursor-pointer">
            <span>{sortOptions[sortBy]}</span>
            <ChevronDown className="h-4 w-4" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {Object.entries(sortOptions).map(([key, label]) => (
            <DropdownMenuItem
              key={key}
              className={cn(sortBy === key && "bg-accent", "cursor-pointer")}
              onClick={() => setSortBy(key as SortBy)}
            >
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <button
        type="button"
        className="inline-flex h-8 items-center justify-center font-medium text-muted-foreground"
        onClick={() => {
          const newDisplayMode = displayMode === "grid" ? "list" : "grid";
          setDisplayMode(newDisplayMode, pageId);
          // 如果是讨论页面，同步到Cookie
          if (isDiscussionPage) {
            syncDiscussionPreferencesToCookie({ display: newDisplayMode });
          }
        }}
      >
        {displayMode === "grid" ? (
          <LayoutGrid className="h-5 w-5" />
        ) : (
          <List className="h-5 w-5" />
        )}
      </button>
    </div>
  );
}
