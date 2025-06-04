"use client";

import * as React from "react";
import { useRef, useCallback, useEffect } from "react";

import { Loader2 } from "lucide-react";
import type { Discussion } from "@/types/discussion";
import type { Pagination } from "@/types/common";
import { api } from "@/lib/api";
import { DiscussionItem } from "@/components/discussion/discussion-item";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";
import { cn } from "@/lib/utils";
import { DiscussionControls } from "@/components/discussion/discussion-controls";
import { SortBy } from "@/types/display-preferences";
import { useDiscussionDisplayStore } from "@/store/discussion-display-store";
import { useRequireAuth } from "@/hooks/use-require-auth";

interface DiscussionsListProps {
  initialDiscussions: Pagination<Discussion>;
  from: string;
  sticky?: Discussion[];
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export function DiscussionsList({
  initialDiscussions,
  from,
  sticky,
}: DiscussionsListProps) {
  const { requireAuth } = useRequireAuth();

  const [discussions, setDiscussions] = React.useState(initialDiscussions);
  const [page, setPage] = React.useState(2);
  const [loading, setLoading] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(
    initialDiscussions.last_page > 1
  );
  const [activeTab, setActiveTab] = React.useState<"recommend" | "trace">(
    "recommend"
  );
  const { getDisplayMode, getSortBy } = useDiscussionDisplayStore();
  const displayMode = getDisplayMode();
  const sortBy = getSortBy();

  const handleDeleteDiscussion = useCallback(
    (deletedSlug: string) => {
      fetchDiscussions(activeTab, discussions.current_page, sortBy);
    },
    [activeTab, discussions.current_page, sortBy]
  );

  const fetchDiscussions = async (
    tab: "recommend" | "trace",
    pageNum: number = 1,
    sort: SortBy = getSortBy("discussion-list")
  ) => {
    setLoading(true);
    try {
      const response = await api.discussions.list({
        q: tab,
        from,
        page: pageNum,
        sort,
      });

      if (pageNum === 1) {
        // 首次加载或刷新
        setDiscussions(response);
        setPage(2);
        setHasMore(response.last_page > 1);
      } else {
        // 加载更多数据
        setDiscussions((prev) => ({
          ...prev,
          items: [...prev.items, ...response.items],
          current_page: pageNum,
          last_page: response.last_page,
        }));

        // 检查是否还有更多页
        setHasMore(pageNum < response.last_page);

        // 只有在还有更多页的情况下才增加页码
        if (pageNum < response.last_page) {
          setPage(pageNum + 1);
        }
      }
    } catch (error) {
      console.error("Failed to fetch discussions:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    fetchDiscussions(activeTab, page, sortBy);
  }, [loading, hasMore, page, activeTab, sortBy]);

  useEffect(() => {
    // 重置滚动位置
    window.scrollTo(0, 0);

    fetchDiscussions(activeTab, 1, sortBy);
  }, [activeTab, sortBy]);

  return (
    <div className="flex flex-col">
      {/* 顶部导航 - 仅在非移动端显示 */}
      <div className="bg-background">
        <div className="mx-auto">
          <div className="flex h-[40px] items-center justify-between px-6 lg:border-b">
            {from === "index" ? (
              <div className="flex items-center space-x-4 lg:space-x-8">
                <button
                  type="button"
                  className={cn(
                    "relative px-2 py-1 transition-colors duration-150",
                    activeTab === "recommend"
                      ? "text-primary font-bold"
                      : "text-muted-foreground font-normal"
                  )}
                  onClick={() => {
                    setActiveTab("recommend");
                    fetchDiscussions("recommend", 1);
                  }}
                >
                  推荐
                  {activeTab === "recommend" && (
                    <span
                      className="absolute left-0 right-0 -bottom-1 h-[3px] rounded bg-primary"
                      style={{ width: "100%" }}
                    />
                  )}
                </button>
                <button
                  type="button"
                  className={cn(
                    "relative px-2 py-1 transition-colors duration-150",
                    activeTab === "trace"
                      ? "text-primary font-bold"
                      : "text-muted-foreground font-normal"
                  )}
                  onClick={() => {
                    requireAuth(() => {
                      setActiveTab("trace");
                      fetchDiscussions("trace", 1);
                    });
                  }}
                >
                  追踪
                  {activeTab === "trace" && (
                    <span
                      className="absolute left-0 right-0 -bottom-1 h-[3px] rounded bg-primary"
                      style={{ width: "100%" }}
                    />
                  )}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4 lg:space-x-8"></div>
            )}

            <DiscussionControls />
          </div>
        </div>
      </div>

      {/* 置顶讨论列表 */}
      {sticky && sticky.length > 0 && (
        <div className="divide-y border-b">
          {sticky.map((discussion, index) => (
            <div className="px-6" key={`sticky-${discussion.slug}-${index}`}>
              <DiscussionItem
                discussion={discussion}
                displayMode={displayMode}
                isLastItem={false}
                onChange={handleDeleteDiscussion}
              />
            </div>
          ))}
        </div>
      )}

      {/* 普通帖子列表 */}
      <div className="divide-y">
        <InfiniteScroll
          loading={loading}
          hasMore={hasMore}
          onLoadMore={loadMore}
          className="divide-y"
        >
          {discussions.items.map((discussion, index) => {
            const isLastItem = index === discussions.items.length - 1;
            return (
              <div className="px-6" key={discussion.slug + index}>
                <DiscussionItem
                  key={discussion.slug + index}
                  discussion={discussion}
                  displayMode={displayMode}
                  isLastItem={isLastItem}
                  onChange={handleDeleteDiscussion}
                />
              </div>
            );
          })}
        </InfiniteScroll>
      </div>
    </div>
  );
}
