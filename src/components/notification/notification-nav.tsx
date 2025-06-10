"use client";

import * as React from "react";
import { Trash2, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NotificationTabType } from "@/hooks/use-notification";
import { useAuth } from "../providers/auth-provider";

interface NotificationNavProps {
  activeType: NotificationTabType;
  onTypeChange: (type: NotificationTabType) => void;
  onClearAll: () => void;
  className?: string;
}

export function NotificationNav({
  activeType,
  onTypeChange,
  onClearAll,
  className,
}: NotificationNavProps) {
  const { user } = useAuth();

  return (
    <div
      className={cn(
        "flex items-center justify-between py-2 px-4 border-b",
        className
      )}
    >
      <div className="flex">
        <button
          className={cn(
            "flex-1 py-2 text-sm font-medium",
            activeType === "all" ? "text-primary" : "text-muted-foreground"
          )}
          onClick={() => onTypeChange("all")}
        >
          全部
        </button>

        <button
          className={cn(
            "flex-1 py-2 pl-4 text-sm font-medium",
            activeType === "mentions" ? "text-primary" : "text-muted-foreground"
          )}
          onClick={() => onTypeChange("mentions")}
        >
          提及
        </button>
        {user && user?.is_board_moderator === 1 && (
          <button
            className={cn(
              "flex-1 py-2 pl-4 text-sm font-medium",
              activeType === "board" ? "text-primary" : "text-muted-foreground"
            )}
            onClick={() => onTypeChange("board")}
          >
            看板
          </button>
        )}
      </div>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground"
          title="清除所有通知"
          onClick={onClearAll}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
