"use client";

import * as React from "react";
import { Search, X, ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface SearchMobileProps {
  triggerClassName?: string;
}

export function SearchMobile({ triggerClassName }: SearchMobileProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [recentSearches, setRecentSearches] = React.useState<string[]>([
    "网页设计",
    "便宜小鸡",
    "黑色星期五",
    "色图",
    "大姐姐",
  ]);
  const [popularSearches, setPopularSearches] = React.useState<string[]>([
    "网页设计",
    "便宜小鸡",
    "黑色星期五",
    "色图",
    "大姐姐",
  ]);
  const [hotTopics, setHotTopics] = React.useState<string[]>([
    "黑五开始啦,哪里有便宜小鸡",
    "嗨嗨嗨",
    "拜托,你这样真的很机车哎",
  ]);
  const [popularBoards, setPopularBoards] = React.useState<
    { name: string; members: number; category: string; avatar: string }[]
  >([
    { name: "色图交流", members: 99, category: "动漫", avatar: "" },
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

      // 关闭搜索界面
      setOpen(false);
    }
  };

  const handleClearRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
  };

  const handleSearchItemClick = (search: string) => {
    setSearchQuery(search);
    // 可以直接触发搜索
    console.log("搜索:", search);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
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
      </SheetTrigger>
      <SheetContent
        side="top"
        className="h-full w-full p-0 pt-0 block [&>button]:hidden"
      >
        <div className="flex items-center justify-between border-b p-3">
          <button onClick={() => setOpen(false)} className="mr-3">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <form onSubmit={handleSearch} className="relative flex-1">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              ref={inputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索关键字"
              className="pl-9 pr-9 py-2 text-base border rounded-full"
              onClick={(e) => e.stopPropagation()}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchQuery("");
                }}
                className="absolute inset-y-0 right-2 flex items-center"
              >
                <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </form>
          <button type="submit" className="ml-3">
            搜索
          </button>
        </div>

        <div className="p-4 overflow-y-auto h-[calc(100%-56px)]">
          {/* 最近搜索 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-medium">最近搜索</h3>
              {recentSearches.length > 0 && (
                <button
                  onClick={handleClearRecentSearches}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  清除
                </button>
              )}
            </div>
            {recentSearches.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {recentSearches.map((search, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80 py-2 flex justify-center"
                    onClick={() => handleSearchItemClick(search)}
                  >
                    {search}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">暂无最近搜索</p>
            )}
          </div>

          {/* 热门搜索 */}
          <div className="mb-6">
            <h3 className="text-base font-medium mb-3">热门搜索</h3>
            <div className="grid grid-cols-3 gap-3">
              {popularSearches.map((search, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-secondary/80 py-2 flex justify-center"
                  onClick={() => handleSearchItemClick(search)}
                >
                  {search}
                </Badge>
              ))}
            </div>
          </div>

          {/* 热门话题 */}
          <div className="mb-6">
            <h3 className="text-base font-medium mb-3">热门话题</h3>
            <div className="space-y-3">
              {hotTopics.map((topic, index) => (
                <div
                  key={index}
                  className="p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted/80"
                  onClick={() => handleSearchItemClick(topic)}
                >
                  <p className="text-sm">{topic}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 热门看板 */}
          <div>
            <h3 className="text-base font-medium mb-3">热门看板</h3>
            <div className="grid grid-cols-3 gap-3">
              {popularBoards.map((board, index) => (
                <div
                  key={index}
                  className="rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSearchItemClick(board.name)}
                >
                  <div className="flex flex-col items-center gap-3">
                    <Avatar className="h-16 w-16 flex-shrink-0">
                      <AvatarImage src={board.avatar} alt={board.name} />
                      <AvatarFallback>{board.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{board.name}</h4>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
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
      </SheetContent>
    </Sheet>
  );
}
