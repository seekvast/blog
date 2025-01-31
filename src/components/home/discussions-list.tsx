"use client";

import * as React from "react";
import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MarkdownRenderer } from "@/components/markdown/markdown-renderer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutGrid,
  List,
  ThumbsUp,
  Heart,
  MessageSquare,
  ChevronDown,
} from "lucide-react";
import type { Discussion } from "@/types/discussion";
import type { Paginate } from "@/types";
import { api } from "@/lib/api";

interface DiscussionsListProps {
  initialDiscussions: Paginate<Discussion>;
}

export function DiscussionsList({ initialDiscussions }: DiscussionsListProps) {
  const [discussions, setDiscussions] =
    useState<Paginate<Discussion>>(initialDiscussions);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(2);
  const [hasMore, setHasMore] = useState(true);
  const [displayMode, setDisplayMode] = useState<"image-text" | "text-only">(
    "image-text"
  );
  const observerRef = useRef<IntersectionObserver>();

  // 1. 添加调试日志
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const response = await api.discussions.list({
        page,
        per_page: 10,
      });

      if (response.items.length === 0 || page >= response.last_page) {
        setHasMore(false);
      } else {
        setDiscussions((prev) => ({
          ...prev,
          items: [...prev.items, ...response.items],
          current_page: page,
          last_page: response.last_page,
        }));
        setPage((prev) => prev + 1);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page]);

  // 2. 清理逻辑
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // 3. 初始数据变化处理
  useEffect(() => {
    setDiscussions(initialDiscussions);
    setPage(2);
    setHasMore(true);
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
  }, [initialDiscussions]);

  // 2. 修改观察者回调，添加更多调试信息
  const lastItemRef = useCallback(
    (node: HTMLElement | null) => {
      console.log(
        "lastItemRef called, node:",
        !!node,
        "hasMore:",
        hasMore,
        "loading:",
        loading
      );

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (node && hasMore && !loading) {
        // 创建一个新的观察者
        observerRef.current = new IntersectionObserver(
          (entries) => {
            if (entries[0].isIntersecting) {
              loadMore();
            }
          },
          {
            root: null,
            rootMargin: "100px", // 增加触发距离
            threshold: 0, // 降低触发阈值
          }
        );

        // 添加一个延时，确保 DOM 完全渲染
        setTimeout(() => {
          if (observerRef.current && node) {
            observerRef.current.observe(node);

            // 立即检查元素是否在视口中
            const rect = node.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            console.log("Element position:", {
              top: rect.top,
              bottom: rect.bottom,
              windowHeight,
            });

            // 如果元素已经在视口中，手动触发加载
            if (rect.top < windowHeight) {
              loadMore();
            }
          }
        }, 100);
      }
    },
    [hasMore, loading, loadMore]
  );

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
                className="h-8 px-1 font-medium hover:bg-transparent hover:text-foreground"
              >
                追踪
              </Button>
              <Button
                variant="ghost"
                className="h-8 px-1 font-medium hover:bg-transparent hover:text-foreground"
              >
                标签
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 space-x-2 hover:bg-transparent hover:text-foreground"
              >
                热门
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-muted-foreground hover:bg-transparent hover:text-foreground"
                onClick={() =>
                  setDisplayMode((prev) =>
                    prev === "image-text" ? "text-only" : "image-text"
                  )
                }
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
        {discussions.items.map((discussion, index) => {
          const isLastItem = index === discussions.items.length - 1;
          console.log("Rendering item", index, "isLastItem:", isLastItem);

          return (
            <article
              key={discussion.slug}
              ref={isLastItem ? lastItemRef : null}
              className="py-4"
            >
              <div className="flex space-x-3">
                {/* 作者头像 */}
                <Avatar className="h-12 w-12 flex-shrink-0">
                  <AvatarImage
                    src={discussion.user.avatar_url}
                    alt={discussion.user.username}
                  />
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
                          const matches =
                            discussion.main_post?.content?.match(regex);
                          const imgUrl = matches
                            ? matches[1].split(" ")[0]
                            : null;

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
                        <div className="flex-1 text-sm line-clamp-3 whitespace-pre-line">
                          <MarkdownRenderer
                            content={discussion.main_post.content}
                            skipMedia={true}
                            className="prose-sm prose-a:text-primary max-w-none [&>p]:!m-0"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 text-sm line-clamp-2">
                        <MarkdownRenderer
                          content={discussion.main_post.content}
                          skipMedia={true}
                          className="prose-sm prose-a:text-primary max-w-none [&>p]:!m-0"
                        />
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex items-center space-x-4 text-xs">
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <ThumbsUp className="h-4 w-4 text-base cursor-pointer" />
                      <span>{discussion.votes}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <MessageSquare className="h-4 w-4 text-base cursor-pointer" />
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
          );
        })}
      </div>

      {/* 4. 添加加载状态指示器 */}
      <div className="h-10 flex items-center justify-center">
        {loading && <div>Loading...</div>}
        {!hasMore && <div>No more items</div>}
      </div>
    </div>
  );
}
