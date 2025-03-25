"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface SearchDropdownProps {
  triggerClassName?: string;
}

export function SearchDropdown({ triggerClassName }: SearchDropdownProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [recentSearches, setRecentSearches] = React.useState<string[]>([
    "网页设计",
    "便宜小鸡",
    "黑色星期五",
    "色图",
    "大姐姐",
  ]);
  const [popularBoards, setPopularBoards] = React.useState<
    { name: string; members: number; category: string; avatar: string }[]
  >([
    { name: "色图交流", members: 99, category: "动漫", avatar: "" },
    { name: "色图交流", members: 99, category: "动漫", avatar: "" },
    { name: "色图交流", members: 99, category: "动漫", avatar: "" },
  ]);

  const [open, setOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open && inputRef.current) {
      // 当下拉菜单打开时，聚焦输入框
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // 保存到最近搜索
      if (!recentSearches.includes(searchQuery)) {
        setRecentSearches((prev) => [searchQuery, ...prev.slice(0, 4)]);
      }

      // 这里可以添加实际的搜索逻辑
      console.log("搜索:", searchQuery);

      // 关闭下拉菜单
      setOpen(false);
    }
  };

  const handleClearRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
  };

  const handleRecentSearchClick = (search: string) => {
    setSearchQuery(search);
    // 可以直接触发搜索
    console.log("搜索:", search);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <div className={`relative ${triggerClassName || ""}`}>
          <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            type="search"
            placeholder="搜尋關鍵字"
            className="pl-8 bg-muted/50 rounded-full h-8 text-base cursor-pointer"
            readOnly
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-full lg:w-[450px] p-0"
        sideOffset={5}
      >
        <form onSubmit={handleSearch} className="relative">
          {searchQuery && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSearchQuery("");
              }}
              className="absolute inset-y-0 right-3 flex items-center"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </form>

        <div className="p-3 max-h-[60vh] overflow-y-auto">
          {/* 最近搜索 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">最近搜索</h3>
              {recentSearches.length > 0 && (
                <button
                  onClick={handleClearRecentSearches}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  清除
                </button>
              )}
            </div>
            {recentSearches.length > 0 ? (
              <div className="flex flex-wrap gap-4">
                {recentSearches.map((search, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80 py-1.5"
                    onClick={() => handleRecentSearchClick(search)}
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
              {popularBoards.map((board, index) => (
                <div
                  key={index}
                  className="rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleRecentSearchClick(board.name)}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Avatar className="h-16 w-16 flex-shrink-0">
                      <AvatarImage src={board.avatar} alt={board.name} />
                      <AvatarFallback>{board.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <h4 className="font-medium text-sm truncate">
                        {board.name}
                      </h4>
                      <div className="flex items-center justify-center text-xs text-muted-foreground mt-1">
                        <span>{board.members} 成员</span>
                        <span className="mx-1">·</span>
                        <span>{board.category}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
