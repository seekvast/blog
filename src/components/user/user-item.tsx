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
    <div className="flex items-center space-x-3 p-3">
      <Link href={`/u/${user.username}?hashid=${user.hashid}`}>
        <Avatar className="h-14 w-14">
          <AvatarImage src={user.avatar_url} alt={user.username} />
          <AvatarFallback>{user.username?.[0].toUpperCase()}</AvatarFallback>
        </Avatar>
      </Link>

      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1">
          <Link href={`/u/${user.username}?hashid=${user.hashid}`}>
            <span className="text-base font-medium text-primary truncate">
              {user.username}
            </span>
          </Link>
        </div>
        <span className="text-sm text-muted-foreground truncate">
          @{user.nickname}
        </span>
      </div>
    </div>
  );
}
