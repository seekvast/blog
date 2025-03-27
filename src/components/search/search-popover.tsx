"use client";

import * as React from "react";
import { Search, X, UserRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SearchSuggestions } from "@/components/search/search-suggestions";
import { useSearch } from "./use-search";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface SearchPopoverProps {
  triggerClassName?: string;
}

export function SearchPopover({ triggerClassName }: SearchPopoverProps) {
  const {
    keyword,
    setKeyword,
    histories,
    hotBoards,
    handleSearch,
    handleClearHistories,
    handleSearchItemClick,
  } = useSearch();

  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // 处理点击外部关闭
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (handleSearch(e)) {
      setOpen(false);
    }
  };

  const onSearchItemClick = (search: string) => {
    if (handleSearchItemClick(search)) {
      setKeyword("");
      setOpen(false);
    }
  };

  return (
    <form onSubmit={onSearch}>
      <div ref={containerRef} className={`relative ${triggerClassName || ""}`}>
        <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <Input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="搜索关键字"
          className="pl-8 pr-8 bg-muted/50 rounded-full h-8 text-sm"
        />
        {keyword && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setKeyword("");
            }}
            className="absolute inset-y-0 right-2 flex items-center"
          >
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}

        {/* 下拉内容 */}
        <div
          className={cn(
            "absolute left-0 right-0 top-full mt-2 rounded-md border bg-popover shadow-md",
            "w-full lg:w-[450px]",
            !open && "hidden"
          )}
        >
          <div className="p-3 max-h-[60vh] overflow-y-auto">
            {/* 最近搜索和热门看板 */}
            <SearchSuggestions
              histories={histories}
              hotBoards={hotBoards}
              onSearchItemClick={onSearchItemClick}
              onClearHistories={handleClearHistories}
              onBoardClick={(board) => setOpen(false)}
              variant="popover"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
