"use client";

import React, { useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";
import { DiscussionItem } from "@/components/discussion/discussion-item";
import { DiscussionControls } from "@/components/discussion/discussion-controls";
import { useDiscussionDisplayStore } from "@/store/discussion-display-store";
import type { Discussion, Pagination } from "@/types";
import { SortBy } from "@/types/display-preferences";

// 1. Props 接口更新，以接收来自服务器的数据和状态
interface UserPostsProps {
  username: string;
  initialPosts: Pagination<Discussion> | null;
  sortBy: SortBy; // sortBy 现在由父组件从 URL 读取并传入
}

export function UserPosts({ username, initialPosts, sortBy }: UserPostsProps) {
  // 2. displayMode 纯视觉状态，可以继续保留在 Zustand 中
  const displayMode = useDiscussionDisplayStore((state) =>
    state.getDisplayMode()
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    isError,
    refetch,
  } = useInfiniteQuery({
    // 3. queryKey 现在使用来自 props 的 sortBy
    queryKey: ["userDiscussions", username, sortBy],
    queryFn: async ({ pageParam = 1 }) => {
      return api.discussions.list({
        from: "user",
        page: pageParam,
        per_page: 10,
        username: username || undefined,
        sort: sortBy,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.current_page < lastPage.last_page
        ? lastPage.current_page + 1
        : undefined;
    },
    enabled: !!username,
    staleTime: 0,
    retry: 1,
    // 4. 使用从服务器传入的 initialPosts 初始化数据
    initialData: {
      pages: initialPosts ? [initialPosts] : [],
      pageParams: [1],
    },
  });

  const loadMore = useCallback(async () => {
    if (!hasNextPage || isFetchingNextPage) return;
    fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleRetry = () => {
    refetch();
  };

  const discussions = data?.pages.flatMap((page) => page.items) || [];

  // 5. 所有的 JSX 结构和 className 都与你的原始代码保持一致
  return (
    <div className="flex flex-col min-w-0 overflow-hidden px-4">
      <div className="bg-background">
        <div className="flex justify-between items-center lg:border-b">
          <h3 className="lg:pb-3 text-md font-semibold ">我的文章</h3>
          <div className="flex items-center space-x-3">
            {/* 6. 将 sortBy prop 传递给 DiscussionControls */}
            <DiscussionControls sortBy={sortBy} />
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
      ) : discussions.length === 0 ? (
        <div className="p-6 text-center text-muted-foreground bg-card rounded-lg">
          该用户还没有发布任何文章。
        </div>
      ) : (
        <div className="min-w-0">
          <InfiniteScroll
            loading={isFetchingNextPage}
            hasMore={!!hasNextPage}
            onLoadMore={loadMore}
            className="divide-y"
          >
            {discussions.map((discussion, index) => (
              <DiscussionItem
                key={discussion.slug}
                discussion={discussion}
                displayMode={displayMode}
                isLastItem={index === discussions.length - 1}
              />
            ))}
          </InfiniteScroll>

          {isError && discussions.length > 0 && (
            <div className="flex flex-col items-center justify-center py-4">
              <p className="text-destructive mb-2">加载数据时出错</p>
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
