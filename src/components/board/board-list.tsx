"use client";

import * as React from "react";
import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";
import { api } from "@/lib/api";
import { Board } from "@/types/board";
import { Category, Pagination } from "@/types/common";
import { ChevronDown } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BoardItem } from "@/components/board/board-item";
import { useRequireAuth } from "@/hooks/use-require-auth";

interface BoardListProps {
  initialPage: Pagination<Board>;
  categories: Category[];
  activeTab: "recommended" | "subscribed";
  categoryFilter: number | null;
}

export function BoardList({
  initialPage,
  categories,
  activeTab,
  categoryFilter,
}: BoardListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { requireAuth } = useRequireAuth();

  const createQueryString = useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams?.toString());
      for (const [key, value] of Object.entries(params)) {
        if (value === null) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      }
      return newSearchParams.toString();
    },
    [searchParams]
  );

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["boards", activeTab, categoryFilter],
      queryFn: ({ pageParam = 1 }) => {
        return api.boards.list({
          page: pageParam,
          per_page: 20,
          q: activeTab,
          ...(categoryFilter && { category_id: categoryFilter }),
        });
      },
      getNextPageParam: (lastPage) => {
        return lastPage.current_page < lastPage.last_page
          ? lastPage.current_page + 1
          : undefined;
      },
      initialData: {
        pages: [initialPage],
        pageParams: [1],
      },
      initialPageParam: 1,
    });

  const boards = data?.pages.flatMap((page) => page.items) ?? [];

  const handleLoadMore = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  };

  const handleTabClick = (tabKey: "recommended" | "subscribed") => {
    const newQuery = createQueryString({ tab: tabKey, category: null });
    const callback = () => router.push(`${pathname}?${newQuery}`);
    if (tabKey === "subscribed") {
      requireAuth(callback);
    } else {
      callback();
    }
  };

  const handleCategoryClick = (categoryId: number | null) => {
    const newQuery = createQueryString({ category: categoryId });
    router.push(`${pathname}?${newQuery}`);
  };

  return (
    <>
      {/* 顶部导航 */}
      <div className="bg-background">
        <div className="mx-auto w-full">
          <div className="flex h-[40px] items-center justify-between relative lg:px-6 lg:border-b">
            <div className="flex items-center space-x-8 relative">
              {[
                { key: "recommended", label: "推荐" },
                { key: "subscribed", label: "已加入" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() =>
                    handleTabClick(tab.key as "recommended" | "subscribed")
                  }
                  className={`relative px-2 py-1 transition-colors duration-150 ${
                    activeTab === tab.key
                      ? "text-primary font-bold"
                      : "text-muted-foreground font-normal"
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.key && (
                    <span className="absolute left-0 right-0 -bottom-1 h-[3px] rounded bg-primary" />
                  )}
                </button>
              ))}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <span className="inline-flex items-center font-medium text-muted-foreground space-x-2  ml-4 cursor-pointer">
                  {categoryFilter
                    ? categories.find((c) => c.id === categoryFilter)?.name
                    : "全部"}
                  <ChevronDown className="h-4 w-4 ml-1" />
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="min-w-[120px]" align="end">
                <DropdownMenuItem
                  onClick={() => handleCategoryClick(null)}
                  className={`justify-center text-center !cursor-pointer ${
                    categoryFilter === null ? "bg-accent" : ""
                  }`}
                >
                  全部
                </DropdownMenuItem>
                {categories.map((category) => (
                  <DropdownMenuItem
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`justify-center text-center !cursor-pointer ${
                      categoryFilter === category.id ? "bg-accent" : ""
                    }`}
                  >
                    {category.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* 看板列表 */}
      <div className="mx-auto w-full">
        <InfiniteScroll
          loading={isFetchingNextPage}
          hasMore={!!hasNextPage}
          onLoadMore={handleLoadMore}
          rootMargin="-10px"
          className="divide-y"
        >
          {boards.map((board) => (
            <div className="lg:px-6" key={board.id}>
              <BoardItem board={board} />
            </div>
          ))}
        </InfiniteScroll>
      </div>
    </>
  );
}
