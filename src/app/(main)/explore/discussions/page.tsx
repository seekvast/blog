"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useInfiniteQuery } from "@tanstack/react-query";
import { DiscussionItem } from "@/components/home/discussion-item";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";
import { ExploreTabs } from "@/components/search/explore-tabs";

export default function DiscussionsPage() {
  const searchParams = useSearchParams();
  const q = searchParams?.get("q") ?? "";
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    error,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["explore-discussions", q],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const response = await api.discussions.list({
          from: "search",
          keyword: q,
          page: pageParam,
        });
        return response;
      } catch (error) {
        throw error;
      }
    },
    getNextPageParam: (lastPage) => {
      return lastPage.current_page < lastPage.last_page
        ? lastPage.current_page + 1
        : undefined;
    },
    enabled: !!q,
    initialPageParam: 1,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground">
        加载中...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[200px] text-destructive">
        获取讨论列表失败，请稍后重试
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <ExploreTabs />

      <InfiniteScroll
        onLoadMore={() => fetchNextPage()}
        hasMore={!!hasNextPage}
        loading={isFetchingNextPage}
      >
        <div className="divide-y">
          {data?.pages
            .flatMap((page) => page.items)
            .map((discussion, index) => {
              return (
                <DiscussionItem
                  key={discussion.slug + index}
                  discussion={discussion}
                  displayMode={"list"}
                />
              );
            })}
        </div>
      </InfiniteScroll>
    </div>
  );
}
