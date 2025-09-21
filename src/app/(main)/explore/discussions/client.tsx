"use client";

import * as React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { DiscussionItem } from "@/components/discussion/discussion-item";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";
import { ExploreTabs } from "@/components/search/explore-tabs";
import { DiscussionControls } from "@/components/discussion/discussion-controls";
import { useDiscussionDisplayStore } from "@/store/discussion-display-store";
import { Discussion, Pagination } from "@/types";
import { SortBy, DisplayMode } from "@/types/display-preferences";

interface ExploreDiscussionsClientProps {
  query: string;
  pageId: string;
  initialDiscussions: Pagination<Discussion> | null;
  sortBy: SortBy;
  initialDisplayMode: DisplayMode;
}

export function ExploreDiscussionsClient({
  query,
  pageId,
  initialDiscussions,
  sortBy,
  initialDisplayMode,
}: ExploreDiscussionsClientProps) {
  const { getDisplayMode, setDisplayMode } = useDiscussionDisplayStore();

  React.useEffect(() => {
    setDisplayMode(initialDisplayMode, pageId);
  }, [initialDisplayMode, pageId, setDisplayMode]);

  const displayMode = getDisplayMode(pageId, initialDisplayMode);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["explore-discussions", query, sortBy],
      queryFn: async ({ pageParam = 1 }) => {
        if (!query) return { items: [], last_page: 1, current_page: 1 };

        return await api.discussions.list({
          from: "search",
          keyword: query,
          page: pageParam,
          sort: sortBy,
        });
      },
      getNextPageParam: (lastPage) => {
        return lastPage && lastPage.current_page < lastPage.last_page
          ? lastPage.current_page + 1
          : undefined;
      },
      initialData: initialDiscussions
        ? { pages: [initialDiscussions], pageParams: [1] }
        : undefined,
      enabled: !!query,
      initialPageParam: 1,
    });

  if (!query) {
    return (
      <div className="flex flex-col">
        <ExploreTabs />
        <div className="flex items-center justify-center h-[200px] text-muted-foreground">
          请输入关键词开始搜索
        </div>
      </div>
    );
  }

  const allDiscussions = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="flex flex-col">
      <ExploreTabs
        controls={
          query ? (
            <DiscussionControls
              sortBy={sortBy}
              pageId={pageId}
              displayMode={displayMode}
            />
          ) : null
        }
      />

      <InfiniteScroll
        onLoadMore={() => fetchNextPage()}
        hasMore={!!hasNextPage}
        loading={isFetchingNextPage}
      >
        <div className="divide-y">
          {allDiscussions.map((discussion, index) => (
            <DiscussionItem
              key={discussion.slug + index}
              discussion={discussion}
              displayMode={displayMode}
            />
          ))}
        </div>
        {allDiscussions.length === 0 && !isFetchingNextPage && (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            没有找到相关结果
          </div>
        )}
      </InfiniteScroll>
    </div>
  );
}
