"use client";

import * as React from "react";
import { useRef, useCallback } from "react";
import { LayoutGrid, List, ChevronDown } from "lucide-react";
import type { Discussion } from "@/types/discussion";
import type { Pagination } from "@/types/common";
import { api } from "@/lib/api";
import { DiscussionItem } from "@/components/home/discussion-item";
import { InfiniteScroll } from "@/components/common/infinite-scroll";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

interface DiscussionsListProps {
  initialDiscussions: Pagination<Discussion>;
  from: string;
}

type DisplayMode = "list" | "grid";
type SortBy = "hot" | "create" | "reply";

export function DiscussionsList({
  initialDiscussions,
  from,
}: DiscussionsListProps) {
  const [displayMode, setDisplayMode] = React.useState<DisplayMode>("grid");
  const [activeTab, setActiveTab] = React.useState<"recommend" | "trace">(
    "recommend"
  );
  const [sortBy, setSortBy] = React.useState<SortBy>("hot");

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["discussions", activeTab, sortBy],
      queryFn: async ({ pageParam = 1 }) => {
        const response = await api.discussions.list({
          q: activeTab,
          from,
          page: pageParam,
          per_page: 10,
          sort: sortBy,
        });
        return response;
      },
      initialData: {
        pages: [{ ...initialDiscussions }],
        pageParams: [1],
      },
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        if (!lastPage || !lastPage.items || lastPage.items.length === 0) {
          return undefined;
        }
        if (lastPage.current_page >= lastPage.last_page) {
          return undefined;
        }
        return lastPage.current_page + 1;
      },
      select: (data) => {
        return {
          pages: data.pages,
          pageParams: data.pageParams,
        };
      },
      staleTime: 0,
      gcTime: 0,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    });

  // 优化数据合并逻辑
  const discussions = React.useMemo(() => {
    if (!data?.pages) return initialDiscussions;

    // 始终合并所有页面数据，保持数据引用稳定
    const mergedData = {
      ...data.pages[0],
      items: data.pages.flatMap((page) => page.items),
      current_page: data.pages[data.pages.length - 1].current_page,
      last_page: data.pages[data.pages.length - 1].last_page,
    };

    // 确保数据引用稳定
    return Object.freeze(mergedData);
  }, [data, initialDiscussions]);

  // 优化加载状态
  const isPageLoading = React.useMemo(() => {
    return isLoading || isFetchingNextPage;
  }, [isLoading, isFetchingNextPage]);

  const queryClient = useQueryClient();

  // 处理 tab 切换
  const handleTabChange = useCallback((tab: "recommend" | "trace") => {
    setActiveTab(tab);
  }, []);

  // 处理排序切换
  const handleSortChange = useCallback((sort: SortBy) => {
    setSortBy(sort);
  }, []);

  // 监听 tab 和排序变化，重置数据
  React.useEffect(() => {
    // 使用 invalidateQueries 替代 resetQueries
    queryClient.invalidateQueries({
      queryKey: ["discussions", activeTab, sortBy],
      exact: true, // 确保精确匹配查询键
      refetchType: "active", // 只重新获取活跃的查询
    });
  }, [activeTab, sortBy, queryClient]);

  const sortOptions = {
    hot: "热门",
    create: "最新发表",
    reply: "最后回复",
  };

  const loadMore = useCallback(async () => {
    if (isFetchingNextPage || !hasNextPage) return;
    await fetchNextPage();
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  return (
    <div className="flex flex-col">
      {/* 顶部导航 - 仅在非移动端显示 */}
      <div className="bg-background">
        <div className="mx-auto">
          <div className="flex h-[40px] items-center justify-between lg:border-b">
            {from === "index" ? (
              <div className="flex items-center space-x-4 lg:space-x-8">
                <button
                  type="button"
                  className={cn(
                    "h-8 font-medium hover:text-primary/90",
                    activeTab === "recommend"
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                  onClick={() => handleTabChange("recommend")}
                >
                  推荐
                </button>
                <button
                  type="button"
                  className={cn(
                    "h-8 font-medium hover:text-primary/90",
                    activeTab === "trace"
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                  onClick={() => handleTabChange("trace")}
                >
                  追踪
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4 lg:space-x-8"></div>
            )}

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
                onClick={() =>
                  setDisplayMode((prev) => (prev === "grid" ? "list" : "grid"))
                }
              >
                {displayMode === "grid" ? (
                  <LayoutGrid className="h-5 w-5" />
                ) : (
                  <List className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 帖子列表 */}
      <div className="divide-y">
        <InfiniteScroll
          loading={isPageLoading}
          hasMore={hasNextPage ?? false}
          onLoadMore={loadMore}
          currentPage={discussions.current_page}
        >
          {discussions.items.map((discussion, index) => {
            const isLastItem = index === discussions.items.length - 1;
            return (
              <DiscussionItem
                key={discussion.slug}
                discussion={discussion}
                displayMode={displayMode}
                isLastItem={isLastItem}
              />
            );
          })}
        </InfiniteScroll>
      </div>

      {/* 加载状态指示器 */}
      <div className="h-10 flex items-center justify-center text-muted-foreground">
        {!hasNextPage && discussions.last_page > 1 && <div>No more items</div>}
      </div>
    </div>
  );
}
