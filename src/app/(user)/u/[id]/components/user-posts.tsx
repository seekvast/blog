"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { DiscussionItem } from "@/components/discussion/discussion-item";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";
import { api } from "@/lib/api";
import type { Discussion } from "@/types/discussion";
import type { Pagination } from "@/types/common";
import { LayoutGrid, List } from "lucide-react";
import { useDiscussionDisplayStore } from "@/store/discussion-display-store";
import { DiscussionControls } from "@/components/discussion/discussion-controls";

export function UserPosts() {
  const searchParams = useSearchParams();
  const hash = searchParams?.get("hash");
  const [discussions, setDiscussions] = useState<Pagination<Discussion>>({
    code: 0,
    items: [],
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10,
    message: "",
    unread_count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver>();
  const { displayMode, setDisplayMode, sortBy } = useDiscussionDisplayStore();

  // 添加控制台日志用于调试
  useEffect(() => {
    console.log("当前显示模式:", displayMode);
  }, [displayMode]);

  // 初始加载
  const fetchDiscussions = useCallback(async () => {
    try {
      const response = await api.discussions.list({
        page: 1,
        per_page: 10,
        user_hashid: hash || undefined,
        sort: sortBy,
      });

      setDiscussions(response);
      setHasMore(response.current_page < response.last_page);
      setPage(2);
    } catch (error) {
      console.error("Failed to fetch initial discussions:", error);
    } finally {
      setLoading(false);
    }
  }, [hash, sortBy]);

  useEffect(() => {
    fetchDiscussions();
  }, [fetchDiscussions]);

  // 加载更多
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const response = await api.discussions.list({
        page,
        per_page: 10,
        user_hashid: hash || undefined,
        sort: sortBy,
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
      console.error("Failed to load more discussions:", error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, hash, sortBy]);

  // 清理 observer
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div className="flex flex-col min-w-0 overflow-hidden px-4">
      <div className="bg-background">
        <div className="flex justify-between items-center lg:border-b">
          <h3 className="lg:pb-3 text-md font-semibold ">我的文章</h3>
          <div className="flex items-center space-x-3">
            <DiscussionControls />
          </div>
        </div>
      </div>
      <div className="divide-y min-w-0">
        <InfiniteScroll
          loading={loading}
          hasMore={hasMore}
          onLoadMore={loadMore}
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
    </div>
  );
}
