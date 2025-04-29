"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { Notification } from "@/types";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";
import { NotificationItem } from "@/components/notification/notification-item";
import { useQuery } from "@tanstack/react-query";

export type NotificationType =
  | "discussionRenamed"
  | "userSuspended"
  | "userUnsuspended"
  | "newPost"
  | "replied"
  | "upVoted"
  | "downVoted"
  | "postMentioned"
  | "userMentioned"
  | "groupMentioned"
  | "discussionLocked"
  | "postLiked";

export type NotificationTabType = "all" | "mentions" | "board";

// 标记所有通知为已读
export function markAllAsRead(notifications: Notification[]): Notification[] {
  return notifications.map((item) => ({
    ...item,
    read_at: new Date().toISOString(),
  }));
}

export function useUnreadNotificationCount(
  enabled = true,
  pollingInterval = 30000
) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const response = await api.notifications.list({
        page: 1,
        per_page: 1,
      });
      return response.unread_count || 0;
    },
    enabled,
    refetchInterval: pollingInterval,
    refetchIntervalInBackground: true,
    staleTime: pollingInterval - 1000,
  });

  return {
    unreadCount: data || 0,
    loading: isLoading,
    error,
    refetch,
  };
}

export function useNotifications(autoLoad: boolean = true) {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [hasMore, setHasMore] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const loadingRef = React.useRef(false);

  const fetchNotifications = React.useCallback(
    async (pageNum: number, query?: any) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      setLoading(true);
      setError(null);
      try {
        const response = await api.notifications.list({
          page: pageNum,
          per_page: 50,
          ...query,
        });

        if (pageNum === 1) {
          setNotifications(response.items ?? []);
        } else {
          setNotifications((prev) => [...prev, ...(response.items ?? [])]);
        }

        // 只根据后端返回的last_page判断是否有更多数据
        setHasMore(pageNum < response.last_page);

        setPage(pageNum);
        setTotal(response.total);
        setUnreadCount(response.unread_count);
      } catch (err) {
        console.error("获取通知失败", err);
        setError("获取通知失败");
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    []
  );

  const loadMore = React.useCallback(() => {
    if (!loadingRef.current && hasMore) {
      fetchNotifications(page + 1);
    }
  }, [hasMore, page, fetchNotifications]);

  // 自动加载第一页数据
  React.useEffect(() => {
    if (autoLoad) {
      fetchNotifications(1);
    }
  }, [autoLoad, fetchNotifications]);

  const markAsRead = React.useCallback(async (notificationId: number) => {
    try {
      await api.notifications.read({ id: notificationId });
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notificationId
            ? { ...item, read_at: new Date().toISOString() }
            : item
        )
      );
    } catch (err) {
      console.error("标记通知已读失败", err);
    }
  }, []);

  const markAllNotificationsAsRead = React.useCallback(async () => {
    try {
      await api.notifications.readAll();
      setNotifications([]);

      setNotifications((prev) =>
        prev.map((item) => ({ ...item, read_at: new Date().toISOString() }))
      );
    } catch (err) {
      console.error("标记所有通知已读失败", err);
    }
  }, []);

  const clearAllNotifications = React.useCallback(async () => {
    try {
      await api.notifications.clear();
      setNotifications([]);
    } catch (err) {
      console.error("清除所有通知失败", err);
    }
  }, []);

  return {
    notifications,
    loading,
    error,
    hasMore,
    total,
    unreadCount,
    fetchNotifications,
    loadMore,
    markAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
  };
}

interface NotificationListProps {
  notifications: Notification[];
  className?: string;
  onItemClick?: (notification: Notification) => void;
  tabType?: NotificationTabType;
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  total?: number;
  unreadCount?: number;
}

export function NotificationPreview({
  notifications,
  className,
  onItemClick,
  loading = false,
  hasMore = false,
  onLoadMore = () => {},
  total = 0,
  unreadCount = 0,
}: NotificationListProps) {
  const handleItemClick = (notification: Notification) => {
    if (onItemClick) {
      onItemClick(notification);
    }
  };

  return (
    <div className="relative flex flex-col h-full">
      {/* 使用一个固定高度的容器，避免加载状态切换时的布局跳动 */}
      <div className={cn("flex flex-col min-h-[200px]", className)}>
        {loading && notifications.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">加载中...</div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">暂无通知</div>
          </div>
        ) : (
          <InfiniteScroll
            loading={loading}
            hasMore={hasMore}
            onLoadMore={onLoadMore}
            className={cn("flex flex-col divide-y divide-border")}
          >
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={handleItemClick}
              />
            ))}
          </InfiniteScroll>
        )}
      </div>

      <div className="sticky bottom-0 left-0 right-0 bg-background">
        <div className="p-3 text-center">
          <Link
            href="/notifications/all"
            className="text-xs text-muted-foreground hover:text-primary"
          >
            查看全部
          </Link>
        </div>
      </div>
    </div>
  );
}
