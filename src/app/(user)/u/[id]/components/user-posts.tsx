"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { DiscussionItem } from "@/components/discussion/discussion-item";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";
import { api } from "@/lib/api";
import type { Discussion } from "@/types/discussion";
import type { Pagination } from "@/types/common";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useDiscussionDisplayStore } from "@/store/discussion-display-store";
import { DiscussionControls } from "@/components/discussion/discussion-controls";

export function UserPosts() {
  const searchParams = useSearchParams();
  const hashid = searchParams?.get("hashid");
  const observerRef = useRef<IntersectionObserver>();
  const displayMode = useDiscussionDisplayStore((state) =>
    state.getDisplayMode()
  );
  const sortBy = useDiscussionDisplayStore((state) => state.getSortBy());

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    isError,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["userDiscussions", hashid, sortBy],
    queryFn: async ({ pageParam = 1 }) => {
      return api.discussions.list({
        page: pageParam,
        per_page: 10,
        user_hashid: hashid || undefined,
        sort: sortBy,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.current_page < lastPage.last_page
        ? lastPage.current_page + 1
        : undefined;
    },
    enabled: !!hashid,
    staleTime: 0,
    retry: 1,
  });

  const loadMore = useCallback(async () => {
    if (!hasNextPage || isFetchingNextPage) return;
    fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const handleRetry = () => {
    refetch();
  };

  const discussions = data?.pages.flatMap((page) => page.items) || [];
  const loading = isFetching && !isFetchingNextPage;

  return (
    <div className="flex flex-col min-w-0 overflow-hidden px-4">
      <div className="bg-background">
        <div className="flex justify-between items-center lg:border-b">
          <h3 className="lg:pb-3 text-md font-semibold ">我的文章</h3>
          <div className="flex items-center space-x-3">
            <DiscussionControls />
          </div>
        </div>
      </div>

      {isError && discussions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10">
          <p className="text-destructive mb-4">加载数据时出错</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            重试
          </button>
        </div>
      ) : (
        <div className="divide-y min-w-0">
          <InfiniteScroll
            loading={isFetchingNextPage}
            hasMore={!!hasNextPage}
            onLoadMore={loadMore}
          >
            {discussions.map((discussion, index) => {
              const isLastItem = index === discussions.length - 1;
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

          {/* 加载更多时出错显示 */}
          {isError && discussions.length > 0 && (
            <div className="flex flex-col items-center justify-center py-4">
              <p className="text-destructive mb-2">加载更多数据时出错</p>
              <button
                onClick={handleRetry}
                className="px-3 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm"
              >
                重试加载
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
