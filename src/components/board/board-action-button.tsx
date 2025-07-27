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
import { EmailVerificationRequiredFeature } from "@/config/email-verification";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { BoardApprovalMode } from "@/constants/board-approval-mode";

interface BoardActionButtonProps {
  board: Board;
  setReportToKaterOpen?: (open: boolean) => void;
  onSubscribeSuccess?: () => void;
  onBlockSuccess?: () => void;
}

export function BoardActionButton({
  board,
  setReportToKaterOpen,
  onSubscribeSuccess,
  onBlockSuccess,
}: BoardActionButtonProps) {
  const { requireAuth, requireAuthAndEmailVerification } = useRequireAuth();
  const { handleBlock, handleUnsubscribe, handleReport, handleSubscribe } =
    useBoardActions();

  const [subscribeBoardOpen, setSubscribeBoardOpen] = useState(false);

  // 渲染对话框
  const renderSubscribeDialog = () => {
    return (
      <SubscribeBoardDialog
        open={subscribeBoardOpen}
        onOpenChange={setSubscribeBoardOpen}
        boardId={board.id}
        question={board.question || ""}
        onSuccess={onSubscribeSuccess}
      />
    );
  };

  const handleSubscribeBoard = () => {
    requireAuthAndEmailVerification(() => {
      if (board.history) return;
      if (
        board.approval_mode === BoardApprovalMode.APPROVAL ||
        board.approval_mode === BoardApprovalMode.AUTO
      ) {
        setSubscribeBoardOpen(true);
      } else {
        handleSubscribe(board.id);
        onSubscribeSuccess?.();
      }
    }, EmailVerificationRequiredFeature.FOLLOW_BOARD);
  };

  const handleBlockBoard = () => {
    requireAuthAndEmailVerification(() => {
      handleBlock(board.id);
      onBlockSuccess?.();
    }, EmailVerificationRequiredFeature.BLOCK);
  };

  const handleReportBoard = () => {
    requireAuthAndEmailVerification(() => {
      if (setReportToKaterOpen) {
        setReportToKaterOpen(true);
      } else {
        handleReport();
      }
    }, EmailVerificationRequiredFeature.REPORT);
  };

  // 未加入
  if (
    !board.board_user ||
    board.board_user.status === BoardUserStatus.KICK_OUT
  ) {
    const content = board.history ? (
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
    return (
      <>
        {content}
        {renderSubscribeDialog()}
      </>
    );
  }

  const { status, user_role } = board.board_user;
  if ((board.is_joined || status === 1) && [1, 2].includes(user_role)) {
    return (
      <Button variant="outline" size="sm" className="rounded-full">
        <Link href={`/b/${board.slug}/settings`}>设定</Link>
      </Button>
    );
  }

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
                handleUnsubscribe(board.id, onBlockSuccess);
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

interface SubscribeBoardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardId: number;
  question: string;
  onSuccess?: () => void;
}

export function SubscribeBoardDialog({
  open,
  onOpenChange,
  boardId,
  question,
  onSuccess,
}: SubscribeBoardDialogProps) {
  const [answer, setAnswer] = useState("");
  const { toast } = useToast();
  const { subscribeWithAnswer, isSubscribing } = useBoardActions();

  const handleSubmit = async () => {
    if (!answer.trim()) {
      toast({
        variant: "destructive",
        title: "请输入答案",
      });
      return;
    }

    subscribeWithAnswer(
      { boardId, answer: answer.trim() },
      {
        onSuccess: () => {
          onOpenChange(false);
          onSuccess?.();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>加入看板</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              请回答以下问题：
            </p>
            <p className="text-sm font-medium mb-3">{question}</p>
            <Input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="请输入您的答案..."
              className="w-full"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubscribing}
            >
              取消
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubscribing || !answer.trim()}
            >
              {isSubscribing ? "提交中..." : "提交"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
