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

interface BoardActionButtonProps {
  board: Board;
  onJoin?: (boardId: number) => void;
  onBlock?: (boardId: number) => void;
  onLeave?: (boardId: number) => void;
  requireAuth: (callback: () => void) => void;
  setReportToKaterOpen?: (open: boolean) => void;
}

export function BoardActionButton({
  board,
  onJoin,
  onBlock,
  onLeave,
  requireAuth,
  setReportToKaterOpen,
}: BoardActionButtonProps) {
  // 使用自定义 Hook 获取默认实现
  const { handleJoin, handleBlock, handleReport, setReportDialogOpen } =
    useBoardActions();

  // 处理加入板块
  const handleJoinBoard = () => {
    requireAuth(() => {
      if (onJoin) {
        onJoin(board.id);
      } else {
        handleJoin(board.id);
      }
    });
  };

  // 处理屏蔽板块
  const handleBlockBoard = () => {
    requireAuth(() => {
      if (onBlock) {
        onBlock(board.id);
      } else {
        handleBlock(board.id);
      }
    });
  };

  // 处理举报板块
  const handleReportBoard = () => {
    requireAuth(() => {
      if (setReportToKaterOpen) {
        setReportToKaterOpen(true);
      } else {
        handleReport();
      }
    });
  };

  // 未加入板块
  if (
    !board.board_user ||
    board.board_user.status === BoardUserStatus.KICK_OUT
  ) {
    return board.history ? (
      <Button size="sm" className="rounded-full" disabled>
        审核中
      </Button>
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
            onClick={handleJoinBoard}
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

  // 其他状态
  return (
    <Button variant="outline" size="sm" className="rounded-full">
      {BoardUserStatusMapping[status as keyof typeof BoardUserStatusMapping] ||
        ""}
    </Button>
  );
}
