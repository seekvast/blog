"use client";

import * as React from "react";
import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MarkdownRenderer } from "@/components/markdown/markdown-renderer";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Icon } from "@/components/icons";
import { UserLink } from "@/components/markdown/user-link";
import { LayoutGrid, List, ThumbsUp, Heart, MessageSquare, ChevronDown } from "lucide-react";
import type { Discussion } from "@/types/discussion";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { http } from "@/lib/request";

interface DiscussionsListProps {
  initialDiscussions: Discussion[];
}

export function DiscussionsList({ initialDiscussions }: DiscussionsListProps) {
  const [discussions, setDiscussions] = React.useState<Discussion[]>(initialDiscussions);
  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState(2); // Start from page 2 since we have initial data
  const [hasMore, setHasMore] = React.useState(true);
  const [displayMode, setDisplayMode] = React.useState<"image-text" | "text-only">("image-text");
  const observerRef = React.useRef<IntersectionObserver>();

  // 响应 initialDiscussions 的变化
  useEffect(() => {
    setDiscussions(initialDiscussions);
    setPage(2);
    setHasMore(true);
  }, [initialDiscussions]);

  const fetchMoreDiscussions = React.useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const response = await http.get(`/api/discussions?page=${page}&per_page=10`);
      if (response.code === 0) {
        if (response.data.items.length === 0) {
          setHasMore(false);
        } else {
          setDiscussions(prev => [...prev, ...response.data.items]);
          setPage(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error("Failed to fetch discussions:", error);
    } finally {
      setLoading(false);
    }
  }, [page, hasMore, loading]);

  return (
    <div className="flex flex-col">
      {/* 顶部导航 */}
      <div className="bg-background">
        <div className="mx-auto">
          <div className="flex h-[40px] items-center justify-between border-b">
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
                onClick={() => setDisplayMode(prev => prev === "image-text" ? "text-only" : "image-text")}
              >
                {displayMode === "image-text" ? (
                  <LayoutGrid className="h-4 w-4" />
                ) : (
                  <List className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 帖子列表 */}
      <div className="divide-y">
        {discussions.map((discussion, index) => (
          <article
            key={discussion.slug}
            ref={index === discussions.length - 1 ? (node) => {
              if (node && hasMore && !loading) {
                if (observerRef.current) {
                  observerRef.current.disconnect();
                }
                observerRef.current = new IntersectionObserver(
                  entries => {
                    if (entries[0].isIntersecting) {
                      fetchMoreDiscussions();
                    }
                  },
                  { threshold: 0.1 }
                );
                observerRef.current.observe(node);
              }
            } : null}
            className="py-4"
          >
            <div className="flex space-x-3">
              {/* 作者头像 */}
              <Avatar className="h-12 w-12 flex-shrink-0">
                <AvatarImage src={discussion.user.avatar_url} alt={discussion.user.username} />
                <AvatarFallback>{discussion.user.username[0]}</AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/discussions/${discussion.slug}`}
                    className="text-xl font-medium text-foreground hover:text-primary"
                  >
                    {discussion.title}
                  </Link>
                </div>

                <div className="mt-1">
                  {displayMode === "image-text" ? (
                    <div className="flex gap-3 items-start">
                      {(() => {
                        // 使用更精确的正则表达式匹配图片URL
                        const regex = /!\[(?:.*?)\]\((https?:\/\/[^)]+)\)/;
                        const matches = discussion.main_post?.content?.match(regex);
                        const imgUrl = matches ? matches[1].split(" ")[0] : null;

                        return imgUrl ? (
                          <div className="flex-shrink-0">
                            <Image
                              src={imgUrl}
                              alt=""
                              width={120}
                              height={80}
                              className="object-cover rounded-lg"
                            />
                          </div>
                        ) : null;
                      })()}
                      <div className="flex-1 text-sm text-muted-foreground line-clamp-3 whitespace-pre-line">
                        <MarkdownRenderer 
                          content={discussion.main_post.content} 
                          skipMedia={true}
                          className="prose prose-sm max-w-none [&>p]:!m-0"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      <MarkdownRenderer 
                        content={discussion.main_post.content}
                        skipMedia={true}
                        className="prose prose-sm max-w-none [&>p]:!m-0"
                      />
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center space-x-4 text-xs">
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <Icon name="thumb_up" className="h-4 w-4 text-base cursor-pointer" />
                    <span>{discussion.votes}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <Icon name="mode_comment" className="h-4 w-4 text-base cursor-pointer" />
                    <span>{discussion.comment_count}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <span>{discussion.diff_humans}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <span>来自 {discussion.board?.name}</span>{" "}
                    <span>#{discussion.board_child?.name}</span>
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
      ) : !hasMore && discussions.length > 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          没有更多了
        </div>
      ) : discussions.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          这里空空如也
        </div>
      ) : null}
    </div>
  );
}
