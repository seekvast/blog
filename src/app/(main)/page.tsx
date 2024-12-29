"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LayoutGrid, ChevronDown, MessageSquare, Heart } from "lucide-react";
import type { Discussion } from "@/types/discussion";
import { http } from "@/lib/request";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

export default function HomePage() {
  const [discussions, setDiscussions] = React.useState<Discussion[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);

  const fetchDiscussions = React.useCallback(async () => {
    try {
      const response = await http.get(`/api/discussions?page=${page}&per_page=10`);

      if (response.code === 0) {
        setDiscussions((prev) => [...prev, ...response.data.items]);
        setHasMore(response.data.current_page < response.data.last_page);
      }
    } catch (error) {
      console.error("Failed to fetch discussions:", error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  React.useEffect(() => {
    fetchDiscussions();
  }, [fetchDiscussions]);

  return (
    <div className="flex flex-col">
      {/* 顶部导航 */}
      <div className="bg-white">
        <div className="mx-auto w-[808px] px-8">
          <div className="flex h-[60px] items-center justify-between border-b border-[#EAEAEA]">
            <div className="flex items-center space-x-8">
              <Button
                variant="ghost"
                className="h-8 px-1 font-medium text-primary hover:bg-transparent hover:text-primary"
              >
                推荐
              </Button>
              <Button
                variant="ghost"
                className="h-8 px-1 font-medium text-muted-foreground hover:bg-transparent hover:text-foreground"
              >
                追踪
              </Button>
              <Button
                variant="ghost"
                className="h-8 px-1 font-medium text-muted-foreground hover:bg-transparent hover:text-foreground"
              >
                标签
              </Button>
              <Button
                variant="ghost"
                className="h-8 px-1 font-medium text-muted-foreground hover:bg-transparent hover:text-foreground"
              >
                标签
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 space-x-2 text-muted-foreground hover:bg-transparent hover:text-foreground"
              >
                热门
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-muted-foreground hover:bg-transparent hover:text-foreground"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 帖子列表 */}
      <div className="mx-auto w-[808px] px-8">
        <div className="divide-y">
          {discussions.map((discussion) => (
            <article key={discussion.slug} className="p-4">
              <div className="flex space-x-3">
                {/* 作者头像 */}
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarFallback>{discussion.user.username[0]}</AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-foreground">
                      {discussion.title}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(
                        new Date(discussion.main_post.created_at),
                        {
                          addSuffix: true,
                          locale: zhCN,
                        }
                      )}
                    </span>
                  </div>

                  <p className="mt-1 text-md text-muted-foreground line-clamp-2">
                    {discussion.main_post.content}
                  </p>

                  {/* <div className="mt-2 flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <span>{discussion.board.name}</span>
                      {discussion.board_child && (
                        <>
                          <span>/</span>
                          <span>{discussion.board_child.name}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center space-x-4">
                      <span>{discussion.view_count} 次浏览</span>
                      <span>{discussion.comment_count} 条评论</span>
                      <span>{discussion.votes} 个赞</span>
                    </div>
                  </div> */}
                  <div className="mt-3 flex items-center space-x-4 text-xs">
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Heart className="h-4 w-4" />
                      <span>{discussion.votes}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <MessageSquare className="h-4 w-4" />
                      <span>
                        {discussion.comment_count}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <span>{discussion.diff_humans}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <span>来自 {discussion.board.name}</span> <span>#{ discussion.board_child.name}</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">
            加载中...
          </div>
        ) : hasMore ? (
          <div className="py-8 text-center">
            <Button variant="outline" onClick={() => setPage((p) => p + 1)}>
              加载更多
            </Button>
          </div>
        ) : discussions.length > 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            没有更多了
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            这里空空如也
          </div>
        )}
      </div>
    </div>
  );
}
