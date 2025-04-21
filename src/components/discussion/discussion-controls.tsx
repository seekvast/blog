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

interface DiscussionControlsProps {
  sortBy?: SortBy;
  setSortBy?: (sort: SortBy) => void;
  className?: string;
}

export function DiscussionControls({
  sortBy: externalSortBy,
  setSortBy: externalSetSortBy,
  className,
}: DiscussionControlsProps) {
  const {
    displayMode,
    setDisplayMode,
    sortBy: storeSortBy,
    setSortBy: storeSetSortBy,
  } = useDiscussionDisplayStore();

  // 使用外部传入的状态或者 store 中的状态
  const sortBy = externalSortBy ?? storeSortBy;
  const setSortBy = externalSetSortBy ?? storeSetSortBy;

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
              className={cn(
                sortBy === key && "bg-accent",
                "cursor-pointer"
              )}
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
        onClick={() =>
          setDisplayMode(displayMode === "grid" ? "list" : "grid")
        }
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
