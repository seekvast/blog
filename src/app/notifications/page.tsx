"use client";

import * as React from "react";
import { MobileHeader } from "@/components/layout/mobile-header";
import {
  NotificationList,
  NotificationTabType,
  useNotifications,
} from "@/components/notification/notification-list";
import { Trash2, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const [activeType, setActiveType] =
    React.useState<NotificationTabType>("all");

  const {
    notifications,
    loading,
    error,
    hasMore,
    fetchNotifications,
    loadMore,
    markAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
  } = useNotifications();

  const handleNotificationClick = (notification: any) => {
    // 标记为已读
    markAsRead(notification.id);
  };

  const handleMarkAllAsRead = () => {
    markAllNotificationsAsRead();
  };

  const handleClearAll = () => {
    clearAllNotifications();
  };

  const handleTypeChange = (type: NotificationTabType) => {
    setActiveType(type);
    // 切换标签时重置并重新加载
    fetchNotifications(1);
  };

  // 页面加载时获取通知
  React.useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  return (
    <div className="flex flex-col min-h-screen">
      <MobileHeader variant="detail" title="通知" />
      <main className="flex-1">
        <div className="flex border-b h-12">
          <button
            className={cn(
              "flex-1 py-2 text-sm font-medium",
              activeType === "all"
                ? "text-primary border-b-2 border-b-primary"
                : "text-muted-foreground"
            )}
            onClick={() => handleTypeChange("all")}
          >
            全部
          </button>
          <button
            className={cn(
              "flex-1 py-2 text-sm font-medium",
              activeType === "mentions"
                ? "text-primary border-b-2 border-b-primary"
                : "text-muted-foreground"
            )}
            onClick={() => handleTypeChange("mentions")}
          >
            提及
          </button>
        </div>

        {/* <div className="flex justify-end p-2 border-b">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              title="清除所有通知"
              onClick={handleClearAll}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              title="全部标为已读"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="h-4 w-4" />
            </Button>
          </div>
        </div> */}

        <div className="px-2">
          <NotificationList
            notifications={notifications}
            tabType={activeType}
            onItemClick={handleNotificationClick}
            loading={loading}
            hasMore={hasMore}
            onLoadMore={loadMore}
          />
        </div>
      </main>
    </div>
  );
}
