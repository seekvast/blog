"use client";

import * as React from "react";
import { Search, X, ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useSearch } from "./use-search";

interface SearchMobileProps {
  triggerClassName?: string;
}

export function SearchMobile({ triggerClassName }: SearchMobileProps) {
  const {
    keyword,
    setKeyword,
    histories,
    popularBoards,
    handleSearch,
    handleClearHistories,
    handleSearchItemClick,
  } = useSearch();

  const [open, setOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  const onSearch = (e: React.FormEvent) => {
    if (handleSearch(e)) {
      setOpen(false);
    }
  };

  const onSearchItemClick = (search: string) => {
    if (handleSearchItemClick(search)) {
      setOpen(false);
    }
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
            className="pl-8 bg-muted/50 rounded-full text-base cursor-pointer"
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
          <form onSubmit={onSearch} className="relative flex-1">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              ref={inputRef}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索关键字"
              className="pl-9 pr-9 py-2 text-base border rounded-full"
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
                <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </form>
          <button type="submit" className="ml-3" onClick={onSearch}>
            搜索
          </button>
        </div>

        <div className="p-4 overflow-y-auto h-[calc(100%-56px)]">
          {/* 最近搜索 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-medium">最近搜索</h3>
              {histories.length > 0 && (
                <button
                  onClick={handleClearHistories}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  清除
                </button>
              )}
            </div>
            {histories.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {histories.map((search, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80 py-2 flex justify-center"
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
            <h3 className="text-base font-medium mb-3">热门看板</h3>
            <div className="grid grid-cols-3 gap-3">
              {popularBoards.map((board, index) => (
                <div
                  key={index}
                  className="rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onSearchItemClick(board.name)}
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
