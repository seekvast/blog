"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import type { Discussion, Pagination } from "@/types/";
import { api } from "@/lib/api";
import { DiscussionItem } from "@/components/discussion/discussion-item";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";
import { cn } from "@/lib/utils";
import { DiscussionControls } from "@/components/discussion/discussion-controls";
import { useDiscussionDisplayStore } from "@/store/discussion-display-store";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useInfiniteQuery } from "@tanstack/react-query";
import { SortBy } from "@/types/display-preferences";

interface DiscussionsListProps {
  initialDiscussions: Pagination<Discussion>;
  from: string;
  sortBy: SortBy;
  sticky?: Discussion[];
  boardSlug?: string;
}

export function DiscussionsList({
  initialDiscussions,
  from,
  sortBy,
  sticky,
  boardSlug,
}: DiscussionsListProps) {
  const { requireAuth } = useRequireAuth();

  const [activeTab, setActiveTab] = React.useState<"recommend" | "trace">(
    "recommend"
  );

  const { getDisplayMode } = useDiscussionDisplayStore();
  const displayMode = getDisplayMode();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["discussions", from, sortBy, activeTab, boardSlug],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.discussions.list({
        q: activeTab,
        from,
        page: pageParam,
        sort: sortBy,
        ...(boardSlug && { board_slug: boardSlug }),
      });
      return response;
    },
    getNextPageParam: (lastPage) =>
      lastPage.current_page < lastPage.last_page
        ? lastPage.current_page + 1
        : undefined,
    initialPageParam: 1,
    initialData: { pages: [initialDiscussions], pageParams: [1] },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const discussions = data?.pages.flatMap((page) => page.items) || [];
  const handleDeleteDiscussion = React.useCallback(() => refetch(), [refetch]);
  const loadMore = React.useCallback(() => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <div className="flex flex-col">
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
                  onClick={() => setActiveTab("recommend")}
                >
                  推荐
                  {activeTab === "recommend" && (
                    <span className="absolute left-0 right-0 -bottom-1 h-[3px] rounded bg-primary" />
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
                  onClick={() => requireAuth(() => setActiveTab("trace"))}
                >
                  追踪
                  {activeTab === "trace" && (
                    <span className="absolute left-0 right-0 -bottom-1 h-[3px] rounded bg-primary" />
                  )}
                </button>
              </div>
            ) : (
              <div />
            )}
            <DiscussionControls sortBy={sortBy} />
          </div>
        </div>
      </div>

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

      {!error && (
        <div>
          <InfiniteScroll
            loading={isFetchingNextPage}
            hasMore={!!hasNextPage}
            onLoadMore={loadMore}
            className="divide-y"
          >
            {discussions.map((discussion, index) => (
              <div className="lg:px-6" key={discussion.slug + index}>
                <DiscussionItem
                  discussion={discussion}
                  displayMode={displayMode}
                  isLastItem={index === discussions.length - 1}
                  onChange={handleDeleteDiscussion}
                />
              </div>
            ))}
          </InfiniteScroll>

          {isLoading && discussions.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-muted-foreground">加载中...</span>
            </div>
          )}

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
