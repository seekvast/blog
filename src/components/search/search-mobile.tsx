"use client";

import * as React from "react";
import { Search, X, ChevronLeft, UserRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { SearchSuggestions } from "@/components/search/search-suggestions";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { useSearch } from "./use-search";
import Link from "next/link";

interface SearchMobileProps {
  triggerClassName?: string;
}

export function SearchMobile({ triggerClassName }: SearchMobileProps) {
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
      setKeyword("");
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
        <SheetTitle className="sr-only">搜索</SheetTitle>
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
          {/* 使用封装的搜索建议组件 */}
          <SearchSuggestions
            histories={histories}
            hotBoards={hotBoards}
            onSearchItemClick={onSearchItemClick}
            onClearHistories={handleClearHistories}
            variant="mobile"
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
