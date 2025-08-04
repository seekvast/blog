"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Reply, MoreHorizontal } from "lucide-react";
import { VoteButtons } from "@/components/common/vote-buttons";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  useInfiniteQuery,
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";
import { PostContent } from "@/components/post/post-content";
import type { Post } from "@/types/discussion";
import { Pagination } from "@/types";
import { fromNow } from "@/lib/dayjs";
import { CommentActions } from "@/components/post/comment-actions";

interface UserRepliesProps {
  replies?: Post[];
  username?: string; // 修改参数名
}

export function UserReplies({ username }: UserRepliesProps) {
  const queryClient = useQueryClient();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery<
      Pagination<Post>,
      Error,
      InfiniteData<Pagination<Post>>,
      string[],
      number
    >({
      queryKey: ["user-replies"],
      queryFn: ({ pageParam = 1 }) =>
        api.users.getPosts({
          username: username || undefined, // 使用 username 参数
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
    });

  const allReplies = data?.pages.flatMap((page) => page.items) || [];

  if (isLoading) {
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
      <InfiniteScroll
        loading={isFetchingNextPage}
        hasMore={hasNextPage}
        onLoadMore={() => fetchNextPage()}
        className="space-y-4"
      >
        {allReplies.map((reply) => (
          <div key={reply.id} className="rounded-lg py-4">
            <div className="flex gap-4">
              {/* 左侧头像 */}
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

              {/* 右侧内容区 */}
              <div className="flex-1 space-y-3">
                {/* 回复的文章标题 */}
                <div>
                  <Link
                    href={`/d/${reply.discussion_slug}`}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    {reply.parent_post?.discussion?.title}
                  </Link>
                </div>

                {/* 引用的内容 */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Reply className="w-4 h-4 flex-shrink-0" />
                    {(reply.parent_post || reply.discussion.main_post) && (
                      <PostContent
                        post={reply.parent_post || reply.discussion.main_post}
                      />
                    )}
                  </div>
                </div>

                {/* 回复内容 */}
                <div className="text-sm text-gray-900">
                  <PostContent post={reply} />
                </div>

                {/* 底部操作栏 */}
                <div className="flex justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <VoteButtons
                      postId={reply.id}
                      upVotesCount={reply.up_votes_count}
                      downVotesCount={reply.down_votes_count}
                      userVote={reply.user_voted}
                      onVoteSuccess={() =>
                        queryClient.invalidateQueries({
                          queryKey: ["user-replies"],
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
    </div>
  );
}
