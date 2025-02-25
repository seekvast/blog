"use client";

import * as React from "react";
import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MarkdownRenderer } from "@/components/markdown/markdown-renderer";
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
import { useDevice } from "@/hooks/use-device";
import { cn } from "@/lib/utils";

interface DiscussionsListProps {
  initialDiscussions: Paginate<Discussion>;
}

type DisplayMode = "list" | "grid";

export function DiscussionsList({ initialDiscussions }: DiscussionsListProps) {
  const { isMobile } = useDevice();
  const [displayMode, setDisplayMode] = React.useState<DisplayMode>("grid");
  const [discussions, setDiscussions] = React.useState(initialDiscussions);
  const [page, setPage] = React.useState(2);
  const [loading, setLoading] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);
  const observerRef = useRef<IntersectionObserver>();

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

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

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
      {/* 顶部导航 - 仅在非移动端显示 */}
      <div className="bg-background">
        <div className="mx-auto">
          <div className="flex h-[40px] items-center justify-between lg:border-b">
            <div className="flex items-center space-x-4 lg:space-x-8">
              <button
                type="button"
                className="h-8 font-medium text-primary hover:text-primary/90"
              >
                推荐
              </button>
              <button
                type="button"
                className="h-8 font-medium text-muted-foreground hover:text-foreground"
              >
                追踪
              </button>
              <button
                type="button"
                className="h-8 font-medium text-muted-foreground hover:text-foreground"
              >
                标签
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                className="inline-flex items-center space-x-2 font-medium text-muted-foreground"
              >
                热门
                <ChevronDown className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="inline-flex h-8 items-center justify-center font-medium text-muted-foreground"
                onClick={() =>
                  setDisplayMode((prev) => (prev === "grid" ? "list" : "grid"))
                }
              >
                {displayMode === "grid" ? (
                  <LayoutGrid className="h-4 w-4" />
                ) : (
                  <List className="h-4 w-4" />
                )}
              </button>
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

      {/* 加载状态指示器 */}
      <div className="h-10 flex items-center justify-center text-muted-foreground">
        {!hasMore && <div>No more items</div>}
      </div>
    </div>
  );
}
