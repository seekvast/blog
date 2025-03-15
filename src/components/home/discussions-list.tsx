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
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import type { Discussion } from "@/types/discussion";
import type { Pagination } from "@/types/common";
import { api } from "@/lib/api";
import { DiscussionItem } from "@/components/home/discussion-item";
import { InfiniteScroll } from "@/components/common/infinite-scroll";
import { useDevice } from "@/hooks/use-device";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DiscussionsListProps {
  initialDiscussions: Pagination<Discussion>;
}

type DisplayMode = "list" | "grid";

export function DiscussionsList({ initialDiscussions }: DiscussionsListProps) {
  const { isMobile } = useDevice();
  const [displayMode, setDisplayMode] = React.useState<DisplayMode>("grid");
  const [discussions, setDiscussions] = React.useState(initialDiscussions);
  const [page, setPage] = React.useState(2);
  const [loading, setLoading] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<"recommend" | "trace">(
    "recommend"
  );
  const [sortBy, setSortBy] = React.useState<"hot" | "latest" | "last_reply">(
    "hot"
  );
  const observerRef = useRef<IntersectionObserver>();

  const sortOptions = {
    hot: "热门",
    latest: "最新发表",
    last_reply: "最后回复",
  };

  const fetchDiscussions = async (
    tab: "recommend" | "trace",
    pageNum: number = 1
  ) => {
    setLoading(true);
    try {
      const response = await api.discussions.list({
        q: tab,
        page: pageNum,
        per_page: 10,
        sort: sortBy,
      });

      if (pageNum === 1) {
        setDiscussions(response);
        setPage(2);
        setHasMore(true);
      } else {
        if (response.items.length === 0 || pageNum >= response.last_page) {
          setHasMore(false);
        } else {
          setDiscussions((prev) => ({
            ...prev,
            items: [...prev.items, ...response.items],
            current_page: pageNum,
            last_page: response.last_page,
          }));
          setPage((prev) => prev + 1);
        }
      }
    } catch (error) {
      console.error("Failed to fetch discussions:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    await fetchDiscussions(activeTab, page);
  }, [loading, hasMore, page, activeTab]);

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
                className={cn(
                  "h-8 font-medium hover:text-primary/90",
                  activeTab === "recommend"
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
                onClick={() => {
                  setActiveTab("recommend");
                  fetchDiscussions("recommend", 1);
                }}
              >
                推荐
              </button>
              <button
                type="button"
                className={cn(
                  "h-8 font-medium hover:text-primary/90",
                  activeTab === "trace"
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
                onClick={() => {
                  setActiveTab("trace");
                  fetchDiscussions("trace", 1);
                }}
              >
                追踪
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center space-x-2 font-medium text-muted-foreground hover:text-foreground"
                  >
                    <span>{sortOptions[sortBy]}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {Object.entries(sortOptions).map(([key, label]) => (
                    <DropdownMenuItem
                      key={key}
                      className={cn(sortBy === key && "bg-accent")}
                      onClick={() => {
                        setSortBy(key as "hot" | "latest" | "last_reply");
                        fetchDiscussions(activeTab, 1);
                      }}
                    >
                      {label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <button
                type="button"
                className="inline-flex h-8 items-center justify-center font-medium text-muted-foreground"
                onClick={() =>
                  setDisplayMode((prev) => (prev === "grid" ? "list" : "grid"))
                }
              >
                {displayMode === "grid" ? (
                  <LayoutGrid className="h-5 w-5" />
                ) : (
                  <List className="h-5 w-5" />
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
