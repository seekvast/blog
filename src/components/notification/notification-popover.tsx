"use client";

import * as React from "react";
import { Bell, Trash2, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  NotificationPreview,
  NotificationTabType,
  useNotifications,
} from "./notification-preview";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useRouter } from "next/navigation";
import { NotificationIcon } from "./notification-icon";

interface NotificationPopoverProps {
  triggerClassName?: string;
  autoLoad?: boolean;
}

export function NotificationPopover({
  triggerClassName,
  autoLoad = true,
}: NotificationPopoverProps) {
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 640px)");
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
  } = useNotifications(autoLoad);

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
      fetchNotifications(1);
    }
  }, [open, fetchNotifications]);

  // 当标签页改变时重新加载
  React.useEffect(() => {
    if (open) {
      fetchNotifications(1);
    }
  }, [activeType, open, fetchNotifications]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild onClick={handleTriggerClick}>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn("relative", triggerClassName)}
        >
          <NotificationIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-screen lg:w-80 p-0 max-h-[70vh] overflow-y-auto"
        align="end"
      >
        <div className="flex flex-col">
          <div className="flex items-center  justify-between py-2 px-4 border-b">
            <div className="flex">
              <button
                className={cn(
                  "flex-1 py-2 text-sm font-medium",
                  activeType === "all"
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
                onClick={() => handleTypeChange("all")}
              >
                全部
              </button>

              <button
                className={cn(
                  "flex-1 py-2 pl-4 text-sm font-medium",
                  activeType === "mentions"
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
                onClick={() => handleTypeChange("mentions")}
              >
                提及
              </button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground"
                title="清除所有通知"
                onClick={handleClearAll}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground"
                title="全部标为已读"
                onClick={handleMarkAllAsRead}
              >
                <CheckCheck className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <NotificationPreview
          notifications={notifications}
          tabType={activeType}
          onItemClick={handleNotificationClick}
          loading={loading}
          hasMore={hasMore}
          onLoadMore={loadMore}
        />
      </PopoverContent>
    </Popover>
  );
}
