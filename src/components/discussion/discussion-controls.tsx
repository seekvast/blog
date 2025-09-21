"use client";

import * as React from "react";
import { LayoutGrid, List, ChevronDown } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDiscussionDisplayStore } from "@/store/discussion-display-store";
import { SortBy, DisplayMode } from "@/types/display-preferences";
import { syncDiscussionPreferencesToCookie } from "@/lib/discussion-preferences";

interface DiscussionControlsProps {
  sortBy: SortBy;
  className?: string;
  pageId: string;
  displayMode: DisplayMode;
}

export function DiscussionControls({
  sortBy,
  className,
  pageId,
  displayMode,
}: DiscussionControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { setDisplayMode } = useDiscussionDisplayStore();
  //   const displayMode = getDisplayMode(pageId, "list");

  const handleSortChange = (newSort: SortBy) => {
    syncDiscussionPreferencesToCookie(pageId, { sort: newSort });

    const current = new URLSearchParams(
      Array.from(searchParams?.entries() ?? [])
    );
    current.set("sort", newSort);
    const search = current.toString();
    const query = search ? `?${search}` : "";

    router.push(`${pathname}${query}`);
  };

  const sortOptions: Record<SortBy, string> = {
    hot: "热门",
    newest: "最新发表",
    last: "最后回复",
  };

  return (
    <div className={cn("flex items-center space-x-3", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="inline-flex items-center space-x-1 font-medium text-muted-foreground cursor-pointer">
            <span>{sortOptions[sortBy] || "排序"}</span>
            <ChevronDown className="h-4 w-4" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {Object.entries(sortOptions).map(([key, label]) => (
            <DropdownMenuItem
              key={key}
              className={cn(sortBy === key && "bg-accent", "cursor-pointer")}
              onClick={() => handleSortChange(key as SortBy)}
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
          syncDiscussionPreferencesToCookie(pageId, {
            display: newDisplayMode,
          });
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
