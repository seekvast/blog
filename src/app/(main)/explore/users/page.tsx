"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useInfiniteQuery } from "@tanstack/react-query";
import { UserItem } from "@/components/user/user-item";
import { InfiniteScroll } from "@/components/common/infinite-scroll";
import { ExploreTabs } from "@/components/search/explore-tabs";

export default function UsersPage() {
  const searchParams = useSearchParams();
  const q = searchParams?.get("q") ?? "";

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["explore-users", q],
      queryFn: ({ pageParam = 1 }) =>
        api.users.list({ from: "search", keyword: q, page: pageParam }),
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
        currentPage={data?.pages[0].current_page ?? 1}
        onLoadMore={() => fetchNextPage()}
        hasMore={!!hasNextPage}
        loading={isFetchingNextPage}
        disableInitialCheck={true}
      >
        <div className="divide-y">
          {data?.pages
            .flatMap((page) => page.items)
            .map((user) => (
              <UserItem key={user.username} user={user} />
            ))}
        </div>
      </InfiniteScroll>
    </div>
  );
}
