"use client";

import * as React from "react";
import { useRef, useCallback, useEffect } from "react";

import { Loader2 } from "lucide-react";
import type { Discussion } from "@/types/discussion";
import type { Pagination } from "@/types/common";
import { api } from "@/lib/api";
import { DiscussionItem } from "@/components/discussion/discussion-item";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";
import { cn } from "@/lib/utils";
import { DiscussionControls } from "@/components/discussion/discussion-controls";
import { SortBy } from "@/types/display-preferences";
import { useDiscussionDisplayStore } from "@/store/discussion-display-store";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useInfiniteQuery } from "@tanstack/react-query";

interface DiscussionsListProps {
  initialDiscussions: Pagination<Discussion>;
  from: string;
  sticky?: Discussion[];
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export function DiscussionsList({
  initialDiscussions,
  from,
  sticky,
}: DiscussionsListProps) {
  const { requireAuth } = useRequireAuth();

  const [activeTab, setActiveTab] = React.useState<"recommend" | "trace">(
    "recommend"
  );
  const { getDisplayMode, getSortBy } = useDiscussionDisplayStore();
  const displayMode = getDisplayMode();
  const sortBy = getSortBy();

  // 用于跟踪是否是初始化状态
  const isInitializedRef = useRef(false);
  const initialSortByRef = useRef(sortBy);
  const initialActiveTabRef = useRef(activeTab);

  // 检查是否需要重新获取数据
  const shouldFetchData = useCallback(
    (newActiveTab: "recommend" | "trace", newSortBy: SortBy) => {
      // 如果还没有初始化，记录初始值并跳过
      if (!isInitializedRef.current) {
        initialSortByRef.current = newSortBy;
        initialActiveTabRef.current = newActiveTab;
        isInitializedRef.current = true;
        return false;
      }

      // 如果 activeTab 或 sortBy 发生了变化，需要重新获取
      return (
        newActiveTab !== initialActiveTabRef.current ||
        newSortBy !== initialSortByRef.current
      );
    },
    []
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["discussions", activeTab, from, sortBy],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.discussions.list({
        q: activeTab,
        from,
        page: pageParam,
        sort: sortBy,
      });
      return response;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.current_page < lastPage.last_page
        ? lastPage.current_page + 1
        : undefined;
    },
    initialPageParam: 1,
    // 使用初始数据
    initialData: shouldFetchData(activeTab, sortBy)
      ? undefined
      : {
          pages: [initialDiscussions],
          pageParams: [1],
        },
    staleTime: 10 * 1000,
    refetchOnWindowFocus: false,
  });

  const discussions = data?.pages.flatMap((page) => page.items) || [];

  const handleDeleteDiscussion = useCallback(
    (deletedSlug: string) => {
      refetch();
    },
    [refetch]
  );

  const loadMore = useCallback(() => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    window.scrollTo(0, 0);

    if (shouldFetchData(activeTab, sortBy)) {
      refetch();
      // 更新初始值
      initialSortByRef.current = sortBy;
      initialActiveTabRef.current = activeTab;
    }
  }, [activeTab, sortBy, shouldFetchData, refetch]);

  return (
    <div className="flex flex-col">
      {/* 顶部导航 - 仅在非移动端显示 */}
      <div className="bg-background">
        <div className="mx-auto">
          <div className="flex h-[40px] items-center justify-between lg:px-6 lg:border-b">
            {from === "index" ? (
              <div className="flex items-center space-x-4 lg:space-x-8">
                <button
                  type="button"
                  className={cn(
                    "relative px-2 py-1 transition-colors duration-150",
                    activeTab === "recommend"
                      ? "text-primary font-bold"
                      : "text-muted-foreground font-normal"
                  )}
                  onClick={() => {
                    setActiveTab("recommend");
                  }}
                >
                  推荐
                  {activeTab === "recommend" && (
                    <span
                      className="absolute left-0 right-0 -bottom-1 h-[3px] rounded bg-primary"
                      style={{ width: "100%" }}
                    />
                  )}
                </button>
                <button
                  type="button"
                  className={cn(
                    "relative px-2 py-1 transition-colors duration-150",
                    activeTab === "trace"
                      ? "text-primary font-bold"
                      : "text-muted-foreground font-normal"
                  )}
                  onClick={() => {
                    requireAuth(() => {
                      setActiveTab("trace");
                    });
                  }}
                >
                  追踪
                  {activeTab === "trace" && (
                    <span
                      className="absolute left-0 right-0 -bottom-1 h-[3px] rounded bg-primary"
                      style={{ width: "100%" }}
                    />
                  )}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4 lg:space-x-8"></div>
            )}

            <DiscussionControls />
          </div>
        </div>
      </div>

      {/* 置顶讨论列表 */}
      {sticky && sticky.length > 0 && (
        <div className="divide-y border-b">
          {sticky.map((discussion, index) => (
            <div className="lg:px-6" key={`sticky-${discussion.slug}-${index}`}>
              <DiscussionItem
                discussion={discussion}
                displayMode={displayMode}
                isLastItem={false}
                onChange={handleDeleteDiscussion}
              />
            </div>
          ))}
        </div>
      )}

      {/* 错误状态 */}
      {error && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-destructive mb-4">获取数据失败</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            重新加载
          </button>
        </div>
      )}

      {/* 普通帖子列表 */}
      {!error && (
        <div className="divide-y">
          <InfiniteScroll
            loading={isFetchingNextPage}
            hasMore={!!hasNextPage}
            onLoadMore={loadMore}
            className="divide-y"
          >
            {discussions.map((discussion, index) => {
              const isLastItem = index === discussions.length - 1;
              return (
                <div className="lg:px-6" key={discussion.slug + index}>
                  <DiscussionItem
                    key={discussion.slug + index}
                    discussion={discussion}
                    displayMode={displayMode}
                    isLastItem={isLastItem}
                    onChange={handleDeleteDiscussion}
                  />
                </div>
              );
            })}
          </InfiniteScroll>

          {/* 初始加载状态 */}
          {isLoading && discussions.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-muted-foreground">加载中...</span>
            </div>
          )}

          {/* 没有更多数据时的提示 */}
          {!hasNextPage && !isLoading && discussions.length > 0 && (
            <div className="flex items-center justify-center py-4 text-muted-foreground">
              <span>没有更多内容了</span>
            </div>
          )}

          {/* 空状态 */}
          {!isLoading && discussions.length === 0 && !error && (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <span>暂无数据</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
