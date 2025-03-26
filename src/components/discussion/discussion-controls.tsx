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

export type DisplayMode = "list" | "grid";
export type SortBy = "hot" | "create" | "reply";

interface DiscussionControlsProps {
  displayMode: DisplayMode;
  setDisplayMode: (mode: DisplayMode) => void;
  sortBy: SortBy;
  setSortBy: (sort: SortBy) => void;
}

export function DiscussionControls({
  displayMode,
  setDisplayMode,
  sortBy,
  setSortBy,
}: DiscussionControlsProps) {
  const sortOptions = {
    hot: "热门",
    create: "最新发表",
    reply: "最后回复",
  };

  return (
    <div className="flex items-center space-x-3">
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
