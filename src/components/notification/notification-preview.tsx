"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Notification } from "@/types";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";
import { NotificationItem } from "@/components/notification/notification-item";
import { NotificationTabType } from "@/hooks/use-notification";

interface NotificationListProps {
  notifications: Notification[];
  className?: string;
  onItemClick?: (notification: Notification) => void;
  tabType?: NotificationTabType;
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

export function NotificationPreview({
  notifications,
  className,
  onItemClick,
  loading = false,
  hasMore = false,
  onLoadMore = () => {},
}: NotificationListProps) {
  const handleItemClick = (notification: Notification) => {
    if (onItemClick) {
      onItemClick(notification);
    }
  };

  return (
    <div className="relative flex flex-col h-full">
      <div className={cn("flex-1 flex flex-col", className)}>
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

      <div className="mt-auto border-t border-border bg-background">
        <div className="p-3 text-center">
          <Link
            href="/notifications/all"
            className="font-medium hover:text-primary"
          >
            查看全部
          </Link>
        </div>
      </div>
    </div>
  );
}
