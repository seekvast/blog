"use client";

import * as React from "react";
import { api } from "@/lib/api";
import { Notification } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return await api.notifications.readAll();
    },
    onSuccess: () => {
      queryClient.setQueryData(["notifications", "unread-count"], 0);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllAsRead = React.useCallback(() => {
    markAllAsReadMutation.mutate();
  }, [markAllAsReadMutation]);

  return {
    markAllAsRead,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
  };
}

export function useUnreadNotificationCount(
  enabled = true,
  pollingInterval = 30000
) {
  // 获取未读通知数量
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const response = await api.notifications.unreadCount();
      return response || 0;
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
  const queryClient = useQueryClient();

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

        setHasMore(pageNum < response.last_page);

        setPage(pageNum);
        setTotal(response.total);

      } catch (err) {
        setError("获取通知失败");
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [queryClient]
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

  const markAsRead = React.useCallback(
    async (notificationId: number) => {
      try {
        await api.notifications.read({ id: notificationId });
        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notificationId
              ? { ...item, read_at: new Date().toISOString() }
              : item
          )
        );

        queryClient.setQueryData(
          ["notifications", "unread-count"],
          (oldData: number | undefined) => {
            const count = oldData || 0;
            return count > 0 ? count - 1 : 0;
          }
        );
      } catch (err) {
        setError("标记通知已读失败");
      }
    },
    [queryClient]
  );

  const clearAllNotifications = React.useCallback(async () => {
    try {
      await api.notifications.clear();
      setNotifications([]);
      setUnreadCount(0);
      queryClient.setQueryData(["notifications", "unread-count"], 0);
    } catch (err) {
      setError("清除所有通知失败");
    }
  }, [queryClient]);

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
    clearAllNotifications,
  };
}
