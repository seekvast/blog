"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";
import { api } from "@/lib/api";
import type { PostVoter } from "@/types/discussion";

interface VotersListProps {
  postId: number;
}

export const VotersList = ({ postId }: VotersListProps) => {
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["post-voters", postId],
    queryFn: ({ pageParam }) =>
      api.posts.voters({
        post_id: postId,
        vote: "up",
        page: pageParam,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) => {
      if (lastPage.current_page < lastPage.last_page) {
        return lastPage.current_page + 1;
      }
      return undefined;
    },
    enabled: !!postId,
  });

  const handleLoadMore = React.useCallback(() => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        获取点赞用户失败
      </div>
    );
  }

  // 合并所有页面的数据
  const allVoters = data.pages.flatMap((page: any) => page.items);
  const totalVoters = data.pages[0]?.total || 0;

  return (
    <div>
      <ScrollArea className="h-[400px]">
        <InfiniteScroll
          loading={isFetchingNextPage}
          hasMore={!!hasNextPage}
          onLoadMore={handleLoadMore}
          loadingComponent={
            <div className="flex justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          }
          endMessage={
            allVoters.length > 10 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                没有更多了
              </p>
            )
          }
        >
          <div className="flex flex-col p-1">
            {allVoters.map((voter: PostVoter) => (
              <Link
                key={voter.id}
                className="flex items-center p-2 rounded-md transition-colors hover:bg-muted"
                href={`/u/${voter.user.username}?hashid=${voter.user.hashid}`}
              >
                <Avatar className="h-12 w-12 md:h-14 md:w-14 flex-shrink-0">
                  <AvatarImage src={voter.user.avatar_url} />
                  <AvatarFallback>
                    {voter.user.nickname?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <div className="font-semibold">{voter.user.nickname}</div>
                  <div className="text-sm text-muted-foreground">
                    @{voter.user.username}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </InfiniteScroll>
      </ScrollArea>
    </div>
  );
};
