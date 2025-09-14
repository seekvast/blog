"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useInfiniteQuery } from "@tanstack/react-query";
import { BoardItem } from "@/components/board/board-item";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";
import { ExploreTabs } from "@/components/search/explore-tabs";

export default function BoardsPage() {
  const searchParams = useSearchParams();
  const q = searchParams?.get("q") ?? "";

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["explore-boards", q],
      queryFn: ({ pageParam = 1 }) =>
        api.boards.list({ from: "search", keyword: q, page: pageParam }),
      getNextPageParam: (lastPage) =>
        lastPage.current_page < lastPage.last_page
          ? lastPage.current_page + 1
          : undefined,
      enabled: !!q,
      initialPageParam: 1,
    });

  if (!q) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground">
        请输入搜索关键词
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
            .map((board) => (
              <BoardItem key={board.slug} board={board} />
            ))}
        </div>
      </InfiniteScroll>
    </div>
  );
}
