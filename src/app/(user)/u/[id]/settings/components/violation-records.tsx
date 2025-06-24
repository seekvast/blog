"use client";

import React from "react";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";
import { NotificationItem } from "@/components/notification/notification-item";
import { Notification } from "@/types";
import { useNotifications } from "@/hooks/use-notification";

interface ViolationRecord {
  id: string;
  date: string;
  content: string;
  type: string;
  status: "pending" | "resolved" | "rejected";
}

export default function ViolationRecords({
  violationType,
}: {
  violationType: string;
}) {
  if (violationType === "account") {
    return <Account />;
  } else if (violationType === "board") {
    return <Board />;
  }

  // 默认返回 Account 组件
  return <Account />;
}

const Account = () => {
  const {
    notifications,
    loading,
    hasMore,
    fetchNotifications,
    loadMore,
    markAsRead,
  } = useNotifications(false);

  React.useEffect(() => {
    fetchNotifications(1, { category: "account" });
  }, [fetchNotifications]);

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
  };

  return (
    <div className="space-y-4">
      {loading && notifications.length === 0 ? (
        <div className="flex-1 flex items-center justify-center h-40">
          <p className="text-muted-foreground">加载中...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex-1 flex items-center justify-center h-40">
          <p className="text-muted-foreground">暂无违规记录</p>
        </div>
      ) : (
        <InfiniteScroll
          loading={loading}
          hasMore={hasMore}
          onLoadMore={loadMore}
          className="divide-y"
        >
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClick={handleNotificationClick}
            />
          ))}
        </InfiniteScroll>
      )}
    </div>
  );
};

const Board = () => {
  const {
    notifications,
    loading,
    hasMore,
    fetchNotifications,
    loadMore,
    markAsRead,
  } = useNotifications(false);

  React.useEffect(() => {
    fetchNotifications(1, { category: "board_user" });
  }, [fetchNotifications]);

  const handleNotificationClick = (notification: Notification) => {
    // 标记为已读
    markAsRead(notification.id);
  };
  return (
    <div className="space-y-4">
      <div className="flex-1 min-w-0 px-2 lg:px-4 overflow-hidden">
        {/* 通知列表 */}
        {loading && notifications.length === 0 ? (
          <div className="flex-1 flex items-center justify-center h-40">
            <p className="text-muted-foreground">加载中...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex-1 flex items-center justify-center h-40">
            <p className="text-muted-foreground">暂无通知</p>
          </div>
        ) : (
          <InfiniteScroll
            loading={loading}
            hasMore={hasMore}
            onLoadMore={loadMore}
            className="divide-y divide-border"
          >
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={handleNotificationClick}
              />
            ))}
          </InfiniteScroll>
        )}
      </div>
    </div>
  );
};
