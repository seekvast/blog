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
import { DiscussionItem } from "@/components/home/discussion-item";
import { InfiniteScroll } from "@/components/common/infinite-scroll";

interface DiscussionsListProps {
  initialDiscussions: Paginate<Discussion>;
}

export function DiscussionsList({ initialDiscussions }: DiscussionsListProps) {
  const [discussions, setDiscussions] =
    useState<Paginate<Discussion>>(initialDiscussions);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(2);
  const [hasMore, setHasMore] = useState(true);
  const [displayMode, setDisplayMode] = useState<"grid" | "list">("grid");
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
                className="h-8 hover:bg-transparent hover:text-foreground"
                onClick={() =>
                  setDisplayMode((prev) => (prev === "grid" ? "list" : "grid"))
                }
              >
                {displayMode === "grid" ? (
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
        <InfiniteScroll
          loading={loading}
          hasMore={hasMore}
          onLoadMore={loadMore}
          currentPage={page}
        >
          {discussions.items.map((discussion, index) => {
            const isLastItem = index === discussions.items.length - 1;
            return (
              <DiscussionItem
                key={discussion.slug}
                discussion={discussion}
                displayMode={displayMode}
                isLastItem={isLastItem}
              />
            );
          })}
        </InfiniteScroll>
      </div>

      {/* 4. 添加加载状态指示器 */}
      <div className="h-10 flex items-center justify-center text-muted-foreground">
        {!hasMore && <div>No more items</div>}
      </div>
    </div>
  );
}
