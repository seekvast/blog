"use client";

import * as React from "react";
import { NotificationPreview } from "@/components/notification/notification-preview";
import { useMarkAllNotificationsAsRead, useNotifications, NotificationTabType } from "@/hooks/use-notification";
import { NotificationNav } from "@/components/notification/notification-nav";


export default function Notification() {
  const [open, setOpen] = React.useState(true); // 设置为true，因为在通知页面中通知列表应该是打开的
  const [activeType, setActiveType] =
    React.useState<NotificationTabType>("all");

  const {
    notifications,
    loading,
    hasMore,
    fetchNotifications,
    loadMore,
    markAsRead,
    clearAllNotifications,
  } = useNotifications(true);

  const { markAllAsRead } = useMarkAllNotificationsAsRead();

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    setOpen(false);
  };

  const handleClearAll = () => {
    clearAllNotifications();
  };

  const handleTypeChange = (type: NotificationTabType) => {
    setActiveType(type);
  };

  React.useEffect(() => {
    if (open) {
      fetchNotifications(1, { q: activeType });
    }
  }, [activeType, open, fetchNotifications]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      markAllAsRead();
    }
  }, []);

  return (
    <div className="w-screen p-0 flex flex-col">
      <NotificationNav
        activeType={activeType}
        onTypeChange={handleTypeChange}
        onClearAll={handleClearAll}
      />

      <div className="flex-1 overflow-y-auto">
        <NotificationPreview
          notifications={notifications}
          tabType={activeType}
          onItemClick={handleNotificationClick}
          loading={loading}
          hasMore={hasMore}
          onLoadMore={loadMore}
        />
      </div>
    </div>
  );
}
