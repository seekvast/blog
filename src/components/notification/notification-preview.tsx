"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { api } from "@/lib/api";
import { Notification } from "@/types";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";
import { NotificationItem } from "@/components/notification/notification-item";

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

export type NotificationTabType = "all" | "mentions" | "replies";

// 根据选项卡类型过滤通知
export function filterNotifications(
  notifications: Notification[],
  tabType: NotificationTabType
): Notification[] {
  if (tabType === "all") return notifications;
  if (tabType === "mentions")
    return notifications.filter(
      (n) =>
        n.type === "postMentioned" ||
        n.type === "userMentioned" ||
        n.type === "groupMentioned"
    );
  if (tabType === "replies")
    return notifications.filter((n) => n.type === "replied");
  return notifications;
}

// 标记所有通知为已读
export function markAllAsRead(notifications: Notification[]): Notification[] {
  return notifications.map((item) => ({
    ...item,
    read_at: new Date().toISOString(),
  }));
}

// 获取通知列表的Hook
export function useNotifications(autoLoad: boolean = true) {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [hasMore, setHasMore] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const loadingRef = React.useRef(false);

  const fetchNotifications = React.useCallback(async (pageNum: number) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const response = await api.notifications.list({
        page: pageNum,
        per_page: 20,
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
  }, []);

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
  tabType = "all",
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

  const filteredNotifications = filterNotifications(notifications, tabType);

  // 解析通知数据
  const parseNotificationData = (notification: Notification) => {
    try {
      return typeof notification.data === "string"
        ? JSON.parse(notification.data)
        : notification.data;
    } catch (e) {
      return { title: "通知", message: notification.data || "" };
    }
  };

  const buildMessage = (notification: Notification) => {
    switch (notification.type) {
      case "upVoted":
        return notification.from_user.username + " 對你的文章按了推";
      case "downVoted":
        return notification.from_user.username + " 對你的文章按了嘘";
      case "newPost":
        return notification.from_user.username + " 回覆了你發表的文章";
      case "replied":
        return notification.from_user.username + " 回覆了你的評論";
      default:
        return "";
    }
  };

  return (
    <div className="relative flex flex-col h-full">
      {/* 使用一个固定高度的容器，避免加载状态切换时的布局跳动 */}
      <div className={cn("flex flex-col min-h-[200px]", className)}>
        {loading && filteredNotifications.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">加载中...</div>
          </div>
        ) : filteredNotifications.length === 0 ? (
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
            {filteredNotifications.map((notification) => (
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
            href="/notifications"
            className="text-xs text-muted-foreground hover:text-primary"
          >
            查看全部
          </Link>
        </div>
      </div>
    </div>
  );
}
