"use client";

import * as React from "react";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useUnreadNotificationCount, useMarkAllNotificationsAsRead } from "@/hooks/use-notification";

interface NotificationIconProps {
  className?: string;
  iconClassName?: string;
  autoLoad?: boolean;
  pollingInterval?: number;
  onClick?: () => void;
}

export function NotificationIcon({
  className,
  iconClassName,
  autoLoad = true,
  pollingInterval = 30000,
  onClick,
}: NotificationIconProps) {
  const { unreadCount } = useUnreadNotificationCount(autoLoad, pollingInterval);
  const { markAllAsRead } = useMarkAllNotificationsAsRead();

  const handleClick = (e: React.MouseEvent) => {
    markAllAsRead();
    onClick?.();
  };

  return (
    <div
      className={cn("relative", className)}
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
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
