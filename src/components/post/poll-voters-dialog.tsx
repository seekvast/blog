import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { api } from "@/lib/api";
import { useInfiniteQuery } from "@tanstack/react-query";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";

interface PollVotersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pollId: number;
  discussionSlug: string;
}

const PER_PAGE = 10;

export function PollVotersDialog({
  open,
  onOpenChange,
  pollId,
  discussionSlug,
}: PollVotersDialogProps) {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["poll-voters", pollId],
      queryFn: async ({ pageParam = 1 }) => {
        const response = await api.discussions.getPollVotes({
          poll_id: pollId,
          discussion_slug: discussionSlug,
          page: pageParam as number,
          per_page: PER_PAGE,
        });
        return response;
      },
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        if (lastPage.current_page < lastPage.last_page) {
          return lastPage.current_page + 1;
        }
        return undefined;
      },
      enabled: open,
    });

  // 计算总投票人数
  const totalVoters = data?.pages[0]?.total || 0;
  const allVoters = data?.pages.flatMap((page) => page.items) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[60vh] lg:max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>投票人 ({totalVoters})</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[300px] w-full p-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <InfiniteScroll
              hasMore={hasNextPage}
              loading={isFetchingNextPage}
              onLoadMore={fetchNextPage}
            >
              <div className="space-y-4">
                {allVoters.map((voter) => (
                  <div key={voter.id} className="flex items-center space-x-4">
                    <Link
                      href={`/u/${voter.user.username}?hashid=${voter.user.hashid}`}
                      className="flex items-center space-x-4"
                    >
                      <Avatar>
                        <AvatarImage src={voter.user.avatar_url} />
                        <AvatarFallback>
                          {voter.user.nickname?.[0] || voter.user.username[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {voter.user.username}
                        </p>
                        {voter.user.nickname && (
                          <p className="text-sm text-muted-foreground">
                            @{voter.user.nickname}
                          </p>
                        )}
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </InfiniteScroll>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
