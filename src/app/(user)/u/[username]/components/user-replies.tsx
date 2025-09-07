"use client";

import React from "react";
import Link from "next/link";
import {
  useInfiniteQuery,
  InfiniteData,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api";
import { fromNow } from "@/lib/dayjs";

import { InfiniteScroll } from "@/components/ui/infinite-scroll";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { VoteButtons } from "@/components/common/vote-buttons";
import { PostContent } from "@/components/post/post-content";
import { CommentActions } from "@/components/post/comment-actions";

import type { Post, Pagination } from "@/types";

interface UserRepliesProps {
  username: string;
  initialReplies: Pagination<Post> | null;
}

export function UserReplies({ username, initialReplies }: UserRepliesProps) {
  const queryClient = useQueryClient();

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery<
      Pagination<Post>,
      Error,
      InfiniteData<Pagination<Post>>,
      (string | undefined)[],
      number
    >({
      queryKey: ["user-replies", username],
      queryFn: ({ pageParam = 1 }) =>
        api.users.getPosts({
          username: username || undefined,
          page: pageParam,
          per_page: 10,
        }),
      getNextPageParam: (lastPage) => {
        if (lastPage.current_page < lastPage.last_page) {
          return lastPage.current_page + 1;
        }
        return undefined;
      },
      initialPageParam: 1,
      initialData: {
        pages: initialReplies ? [initialReplies] : [],
        pageParams: [1],
      },
    });

  const allReplies = data?.pages.flatMap((page) => page.items) || [];

  if (isLoading && !initialReplies) {
    return (
      <div className="px-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg py-4">
            <div className="flex gap-4">
              <Skeleton className="h-12 w-12 lg:h-16 lg:w-16 rounded-full" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="px-4">
      <div className="flex justify-between lg:border-b">
        <h3 className="lg:pb-3 text-md font-semibold">我的回复</h3>
        <span className="text-primary">{data?.pages[0]?.total || 0}</span>
      </div>

      {allReplies.length === 0 ? (
        <div className="p-6 text-center text-muted-foreground bg-card rounded-lg">该用户还没有任何回复。</div>
      ) : (
        <InfiniteScroll
          loading={isFetchingNextPage}
          hasMore={!!hasNextPage}
          onLoadMore={() => fetchNextPage()}
          className="space-y-4"
        >
          {allReplies.map((reply) => (
            <div key={reply.id} className="rounded-lg py-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Avatar className="h-12 w-12 lg:h-16 lg:w-16">
                    <AvatarImage
                      src={reply.user.avatar_url}
                      alt={reply.user.nickname}
                    />
                    <AvatarFallback>
                      {reply.user.nickname[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex-1 space-y-3">
                  <h3>
                    <Link
                      href={`/d/${reply.discussion_slug}#post-${reply.id}`}
                      className="hover:text-primary/80 font-medium"
                    >
                      {reply.discussion?.title}
                    </Link>
                  </h3>

                  <div className="bg-subtle rounded-lg p-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {(reply.parent_post || reply.discussion.main_post) && (
                        <PostContent
                          post={reply.parent_post || reply.discussion.main_post}
                        />
                      )}
                    </div>
                  </div>

                  <div className="text-sm text-gray-900">
                    <PostContent post={reply} />
                  </div>

                  <div className="flex justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <VoteButtons
                        postId={reply.id}
                        upVotesCount={reply.up_votes_count}
                        downVotesCount={reply.down_votes_count}
                        userVote={reply.user_voted}
                        onVoteSuccess={() =>
                          queryClient.invalidateQueries({
                            queryKey: ["user-replies", username],
                          })
                        }
                      />
                      <span>{fromNow(reply.created_at)}</span>
                    </div>
                    <CommentActions comment={reply} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </InfiniteScroll>
      )}
    </div>
  );
}