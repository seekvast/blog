import * as React from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@/types/user";

interface UserItemProps {
  user: User;
  className?: string;
}

export function UserItem({ user, className }: UserItemProps) {
  return (
    <Link
      href={`/u/${user.username}?hashid=${user.hashid}`}
      className={`flex items-center space-x-3 p-3 hover:bg-muted/50 rounded-lg transition-colors ${className}`}
    >
      <Avatar className="h-14 w-14">
        <AvatarImage src={user.avatar_url} alt={user.username} />
        <AvatarFallback>{user.username?.[0]}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-base font-medium text-primary truncate">
            {user.username}
          </span>
        </div>
        <span className="text-sm text-muted-foreground truncate">
          @{user.nickname}
        </span>
      </div>
    </Link>
  );
}
