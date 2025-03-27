"use client";

import * as React from "react";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNotifications } from "./notification-list";

interface NotificationIconProps {
  className?: string;
  iconClassName?: string;
  autoLoad?: boolean;
}

export function NotificationIcon({
  className,
  iconClassName,
  autoLoad = true,
}: NotificationIconProps) {
  const { total } = useNotifications(autoLoad);

  return (
    <div className={cn("relative", className)}>
      <Bell className={cn("h-5 w-5", iconClassName)} />
      {total > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-2 h-4 w-4 flex items-center justify-center text-[10px] p-0"
        >
          {total > 999 ? "999+" : total}
        </Badge>
      )}
    </div>
  );
}
