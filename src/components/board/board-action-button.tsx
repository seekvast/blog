"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Board } from "@/types";
import { ChevronDown, LockIcon, UserRound, Flag } from "lucide-react";
import {
  BoardUserStatus,
  BoardUserStatusMapping,
} from "@/constants/board-user-status";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBoardActions } from "@/hooks/use-board-actions";
import { useRequireAuth } from "@/hooks/use-require-auth";

interface BoardActionButtonProps {
  board: Board;
  onSubscribe?: (boardId: number) => void;
  onBlock?: (boardId: number) => void;
  setReportToKaterOpen?: (open: boolean) => void;
}

export function BoardActionButton({
  board,
  onSubscribe,
  onBlock,
  setReportToKaterOpen,
}: BoardActionButtonProps) {
  const { requireAuth } = useRequireAuth();
  const {
    handleSubscribe,
    handleBlock,
    handleUnsubscribe,
    handleReport,
    setReportDialogOpen,
  } = useBoardActions();

  const handleSubscribeBoard = () => {
    requireAuth(() => {
      if (onSubscribe) {
        onSubscribe(board.id);
      } else {
        handleSubscribe(board.id);
      }
    });
  };

  const handleBlockBoard = () => {
    requireAuth(() => {
      if (onBlock) {
        onBlock(board.id);
      } else {
        handleBlock(board.id);
      }
    });
  };

  const handleReportBoard = () => {
    requireAuth(() => {
      if (setReportToKaterOpen) {
        setReportToKaterOpen(true);
      } else {
        handleReport();
      }
    });
  };

  // 未加入
  if (
    !board.board_user ||
    board.board_user.status === BoardUserStatus.KICK_OUT
  ) {
    return board.history ? (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            className="rounded-full flex items-center gap-1"
            variant="outline"
          >
            审核中 <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            onClick={() =>
              requireAuth(() => {
                handleUnsubscribe(board.id);
              })
            }
            className="cursor-pointer text-destructive hover:text-destructive"
          >
            取消申请
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ) : (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            className="rounded-full flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
          >
            加入 <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            onClick={handleSubscribeBoard}
            className="cursor-pointer"
          >
            <UserRound className="mr-2 h-4 w-4" />
            加入
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={handleBlockBoard}
          >
            <LockIcon className="mr-2 h-4 w-4" />
            拉黑
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={handleReportBoard}
          >
            <Flag className="mr-2 h-4 w-4" />
            检举看板
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  const { status, user_role } = board.board_user;
  // 已通过审核且是管理员
  if ((board.is_joined || status === 1) && [1, 2].includes(user_role)) {
    return (
      <Button variant="outline" size="sm" className="rounded-full">
        <Link href={`/b/${board.slug}/settings`}>设定</Link>
      </Button>
    );
  }

  // 已加入状态（通过审核但不是管理员）
  if (status === 1) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            className="rounded-full flex items-center gap-1"
            variant="outline"
          >
            已加入 <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            onClick={() =>
              requireAuth(() => {
                handleUnsubscribe(board.id);
              })
            }
            className="cursor-pointer text-destructive hover:text-destructive"
          >
            退出并拉黑
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // 其他状态
  return (
    <Button variant="outline" size="sm" className="rounded-full">
      {BoardUserStatusMapping[status as keyof typeof BoardUserStatusMapping] ||
        ""}
    </Button>
  );
}
