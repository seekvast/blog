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
    <div className="py-2">
      <ScrollArea className="max-h-[300px]">
        <InfiniteScroll
          loading={isFetchingNextPage}
          hasMore={!!hasNextPage}
          onLoadMore={handleLoadMore}
          loadingComponent={
            <div className="flex justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          }
          endMessage={""}
        >
          <div className="flex flex-wrap">
            {allVoters.map((voter: PostVoter) => (
              <Link
                key={voter.id}
                className="flex items-center p-2"
                href={`/u/${voter.user.username}?hashid=${voter.user.hashid}`}
              >
                <Avatar className="h-8 w-8 md:h-12 md:w-12 flex-shrink-0">
                  <AvatarImage src={voter.user.avatar_url} />
                  <AvatarFallback>{voter.user.nickname[0]}</AvatarFallback>
                </Avatar>
              </Link>
            ))}
          </div>
        </InfiniteScroll>
      </ScrollArea>
    </div>
  );
};
