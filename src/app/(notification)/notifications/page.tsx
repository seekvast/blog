"use client";

import * as React from "react";
import {
  NotificationPreview,
  NotificationTabType,
  useNotifications,
} from "@/components/notification/notification-preview";
import { NotificationNav } from "@/components/notification/notification-nav";


export default function AllNotificationPage() {
  const [open, setOpen] = React.useState(false);
  const [activeType, setActiveType] =
    React.useState<NotificationTabType>("all");

  const {
    notifications,
    total,
    loading,
    error,
    hasMore,
    unreadCount,
    fetchNotifications,
    loadMore,
    markAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
  } = useNotifications(true);

  const handleNotificationClick = (notification: any) => {
    // 标记为已读
    markAsRead(notification.id);
    setOpen(false);
  };

  const handleTriggerClick = (e: React.MouseEvent) => {
    // if (isMobile) {
    //   e.preventDefault();
    //   router.push("/notifications");
    // }
  };

  const handleMarkAllAsRead = () => {
    markAllNotificationsAsRead();
  };

  const handleClearAll = () => {
    clearAllNotifications();
  };

  const handleTypeChange = (type: NotificationTabType) => {
    setActiveType(type);
  };

  // 当弹出框打开时刷新通知
  React.useEffect(() => {
    if (open) {
      fetchNotifications(1, { q: activeType });
    }
  }, [open, fetchNotifications]);

  // 当标签页改变时重新加载
  React.useEffect(() => {
    if (open) {
      fetchNotifications(1, { q: activeType });
    }
  }, [activeType, open, fetchNotifications]);

  return (
    <div className="w-screen h-[calc(100vh-4rem)] lg:w-80 lg:h-auto lg:max-h-[70vh] p-0 overflow-y-auto">
      <div className="flex flex-col">
        <NotificationNav
          activeType={activeType}
          onTypeChange={handleTypeChange}
          onClearAll={handleClearAll}
          onMarkAllAsRead={handleMarkAllAsRead}
        />
      </div>

      <NotificationPreview
        notifications={notifications}
        tabType={activeType}
        onItemClick={handleNotificationClick}
        loading={loading}
        hasMore={hasMore}
        onLoadMore={loadMore}
      />
    </div>
  );
}
