"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { DiscussionItem } from "@/components/home/discussion-item";
import { InfiniteScroll } from "@/components/common/infinite-scroll";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { Discussion } from "@/types/discussion";
import type { Paginate } from "@/types";
import { LayoutGrid, List } from "lucide-react";
interface UserPostsProps {}

export function UserPosts() {
  const params = useParams();
  const userId = params?.id as string;
  const [discussions, setDiscussions] = useState<Paginate<Discussion>>({
    code: 0,
    items: [],
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10,
    message: "",
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver>();
  const [displayMode, setDisplayMode] = useState<"grid" | "list">("grid");

  // 初始加载
  const fetchDiscussions = useCallback(async () => {
    try {
      const response = await api.discussions.list({
        page: 1,
        per_page: 10,
        user_hashid: userId,
      });

      setDiscussions(response);
      setHasMore(response.current_page < response.last_page);
      setPage(2);
    } catch (error) {
      console.error("Failed to fetch initial discussions:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

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
        user_hashid: userId,
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
  }, [loading, hasMore, page, userId]);

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
          <button
            className="hover:bg-transparent hover:text-foreground"
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
      <div className="divide-y min-w-0">
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
    </div>
  );
}
