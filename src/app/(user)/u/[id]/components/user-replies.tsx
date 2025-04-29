"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ThumbsUp, ThumbsDown, Reply } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useInfiniteQuery, InfiniteData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";
import { PostContent } from "@/components/post/post-content";
import type { Post } from "@/types/discussion";
import { Pagination } from "@/types";

interface UserRepliesProps {
  replies?: Post[];
}

export function UserReplies({}: UserRepliesProps) {
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
        api.users.getPosts({ page: pageParam, per_page: 10 }),
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
                    alt={reply.user.username}
                  />
                  <AvatarFallback>{reply.user.username[0]}</AvatarFallback>
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
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <button className="hover:text-gray-900 p-1">
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <button className="hover:text-gray-900 p-1">
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                  </div>
                  <span>{reply.created_at}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </InfiniteScroll>
    </div>
  );
}
