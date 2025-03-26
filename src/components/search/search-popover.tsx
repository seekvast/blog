"use client";

import * as React from "react";
import { Search, X, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
    setOpen(false);
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
            {/* 最近搜索 */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">最近搜索</h3>
                {histories.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearHistories}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    清除
                  </button>
                )}
              </div>
              {histories.length > 0 ? (
                <div className="flex flex-wrap gap-4">
                  {histories.map((search, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80 py-1.5"
                      onClick={() => onSearchItemClick(search)}
                    >
                      {search}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">暂无最近搜索</p>
              )}
            </div>

            {/* 热门看板 */}
            <div>
              <h3 className="text-sm font-medium mb-3">热门看板</h3>
              <div className="grid grid-cols-3 gap-3">
                {hotBoards?.map((board, index) => (
                  <div
                    key={index}
                    className="rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => onSearchItemClick(board.name)}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Link
                        href={`/b/${board.slug}`}
                        className="flex flex-col items-center gap-2"
                      >
                        <Avatar className="h-16 w-16 flex-shrink-0">
                          <AvatarImage src={board.avatar} alt={board.name} />
                          <AvatarFallback>{board.name[0]}</AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="text-center">
                        <h4 className="font-medium text-sm truncate">
                          {board.name}
                        </h4>
                        <div className="flex items-center justify-center text-xs text-muted-foreground mt-1">
                          <div className="flex items-center">
                            <User className="h-4 w-4" />
                            <span>{0}成员</span>
                          </div>
                          <span className="mx-1">·</span>
                          <span>{board.category.name}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
