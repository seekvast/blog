"use client";

import * as React from "react";
import { Portal } from "@/components/ui/portal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface User {
  hashid: string;
  username: string;
  nickname: string;
  avatar_url: string;
}

interface MentionPopoverProps {
  show: boolean;
  position: { top: number; left: number };
  users: User[];
  onSelect: (user: User) => void;
}

export function MentionPopover({
  show,
  position,
  users,
  onSelect,
}: MentionPopoverProps) {
  if (!show) return null;

  return (
    <Portal>
      <div
        className="fixed z-[9999] w-64 max-h-48 overflow-y-auto rounded-lg border bg-background p-1 shadow-md"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
      >
        {users.length > 0 ? (
          <div className="space-y-1">
            {users.map((user) => (
              <div
                key={user.hashid}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                onClick={() => onSelect(user)}
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback>{user.nickname[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium">{user.nickname}</span>
                  <span className="text-xs text-muted-foreground">
                    @{user.username}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-2 py-6 text-center text-sm text-muted-foreground">
            未找到用户
          </div>
        )}
      </div>
    </Portal>
  );
}
