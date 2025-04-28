"use client";

import * as React from "react";
import {
  NotificationPreview,
  NotificationTabType,
  useNotifications,
} from "@/components/notification/notification-preview";
import { Trash2, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NotificationItem } from "@/components/notification/notification-item";
import { Notification } from "@/types";
import {
  NotificationDesktopMenu,
  NotificationMobileMenu,
} from "@/components/notification/notification-menu";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";

export default function AllNotificationsPage() {
  const [activeType, setActiveType] =
    React.useState<NotificationTabType>("all");

  const {
    notifications,
    loading,
    hasMore,
    fetchNotifications,
    loadMore,
    markAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
  } = useNotifications();

  const handleNotificationClick = (notification: Notification) => {
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
    <div className="">
      <div className="flex flex-col lg:flex-row">
        {/* PC端导航 */}
        <NotificationDesktopMenu
          activeType={activeType}
          onTypeChange={handleTypeChange}
        />
        {/* 移动端导航 */}
        <NotificationMobileMenu
          activeType={activeType}
          onTypeChange={handleTypeChange}
        />

        {/* 右侧内容区 */}
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
    </div>
  );
}
