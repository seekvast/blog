import React from "react";
import { Badge } from "@/components/ui/badge";
import { BoardUserRole } from "@/constants/board-user-role";
import { BoardUser, Board } from "@/types/board";
import { cn } from "@/lib/utils";

interface UserRoleBadgeProps {
  boardUser: BoardUser | null | undefined;
  board: Board;
  className?: string;
}

export const UserRoleBadge: React.FC<UserRoleBadgeProps> = React.memo(
  ({ boardUser, board, className }) => {
    if (!boardUser || !board) return null;

    const shouldShowBadge =
      board.badge_visible &&
      board.badge_visible.length > 0 &&
      board.badge_visible.includes(boardUser.user_role);

    if (!shouldShowBadge) return null;
    
    const badgeClassName = cn(
      "ml-1",
      boardUser.user_role === 1 && "bg-blue-500/10 text-blue-600",
      boardUser.user_role === 2 && "bg-amber-400/20 text-amber-600",
      boardUser.user_role === 3 && "text-primary",
      className
    );

    return (
      <Badge variant="secondary" className={badgeClassName}>
        {BoardUserRole[boardUser.user_role]}
      </Badge>
    );
  }
);

UserRoleBadge.displayName = "UserRoleBadge";
