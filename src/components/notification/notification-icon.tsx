"use client";

import * as React from "react";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNotifications, useUnreadNotificationCount } from "./notification-preview";

interface NotificationIconProps {
  className?: string;
  iconClassName?: string;
  autoLoad?: boolean;
  pollingInterval?: number;
}

export function NotificationIcon({
  className,
  iconClassName,
  autoLoad = true,
  pollingInterval = 30000, // 默认30秒轮询一次
}: NotificationIconProps) {
  // 使用新的 hook 获取未读通知数量，支持轮询
  const { unreadCount } = useUnreadNotificationCount(autoLoad, pollingInterval);

  return (
    <div className={cn("relative", className)}>
      <Bell className={cn("h-5 w-5", iconClassName)} />
      {unreadCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-2 h-4 w-4 flex items-center justify-center text-[10px] p-0"
        >
          {unreadCount > 999 ? "999+" : unreadCount}
        </Badge>
      )}
    </div>
  );
}
