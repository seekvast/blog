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
  const {
    handleBlock,
    handleUnsubscribe,
    handleSubscribe,
    cancelSubscriptionRequest,
    isBlocking,
    isUnsubscribing,
  } = useBoardActions();

  const [subscribeBoardOpen, setSubscribeBoardOpen] = useState(false);

  const handleSubscribeBoard = () => {
    requireAuthAndEmailVerification(() => {
      if (board.history) return;
      if (
        board.approval_mode === BoardApprovalMode.APPROVAL ||
        board.approval_mode === BoardApprovalMode.AUTO
      ) {
        setSubscribeBoardOpen(true);
      } else {
        handleSubscribe(board.id, { onSuccess: onSubscribeSuccess });
      }
    }, EmailVerificationRequiredFeature.FOLLOW_BOARD);
  };

  const handleBlockBoard = (quit?: boolean) => {
    requireAuthAndEmailVerification(() => {
      handleBlock(board.id, quit, { onSuccess: onBlockSuccess });
    }, EmailVerificationRequiredFeature.BLOCK);
  };

  const handleReportBoard = () => {
    requireAuthAndEmailVerification(() => {
      setReportToKaterOpen?.(true);
    }, EmailVerificationRequiredFeature.REPORT);
  };

  // 1. Owner or Admin view
  const { status, user_role } = board.board_user || {};
  if (
    (board.is_joined || status === 1) &&
    user_role &&
    [1, 2].includes(user_role)
  ) {
    return (
      <Button variant="outline" size="sm" className="rounded-full" asChild>
        <Link href={`/b/${board.slug}/settings`}>设定</Link>
      </Button>
    );
  }

  // 2. Pending approval view
  if (board.history) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            className="rounded-full flex items-center gap-1"
            variant="outline"
            disabled={isUnsubscribing}
          >
            审核中 <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            onClick={() =>
              requireAuth(() => {
                cancelSubscriptionRequest(board.id);
              })
            }
            className="cursor-pointer text-destructive hover:text-destructive"
            disabled={isUnsubscribing}
          >
            {isUnsubscribing ? "取消中..." : "取消申请"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // 3. Joined view
  if (status === BoardUserStatus.PASS) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            className="rounded-full flex items-center gap-1"
            variant="outline"
            disabled={isUnsubscribing || isBlocking}
          >
            已加入 <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            onClick={() =>
              requireAuth(() => {
                handleBlockBoard(true);
              })
            }
            className="cursor-pointer text-destructive"
            disabled={isBlocking}
          >
            {isBlocking ? "处理中..." : "退出并拉黑"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              requireAuth(() => {
                handleUnsubscribe(board.id);
              })
            }
            className="cursor-pointer"
            disabled={isUnsubscribing}
          >
            {isUnsubscribing ? "退出中..." : "退出"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (
    !board.board_user ||
    status === BoardUserStatus.KICK_OUT ||
    status === BoardUserStatus.LEAVE
  ) {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              className="rounded-full flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
              disabled={isBlocking}
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
              onClick={() => handleBlockBoard()}
              disabled={isBlocking}
            >
              <LockIcon className="mr-2 h-4 w-4" />
              {isBlocking ? "拉黑中..." : "拉黑"}
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
        <SubscribeBoardDialog
          open={subscribeBoardOpen}
          onOpenChange={setSubscribeBoardOpen}
          boardId={board.id}
          question={board.question || ""}
          onSuccess={onSubscribeSuccess}
        />
      </>
    );
  }

  //禁言中用户可退出看板
  if (status === BoardUserStatus.MUTE) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            className="rounded-full flex items-center gap-1"
            variant="outline"
            disabled={isUnsubscribing}
          >
            已禁言 <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            onClick={() =>
              requireAuth(() => {
                handleUnsubscribe(board.id, 7);
              })
            }
            className="cursor-pointer"
            disabled={isUnsubscribing}
          >
            {isUnsubscribing ? "退出中..." : "退出"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (status && status in BoardUserStatusMapping) {
    return (
      <Button variant="outline" size="sm" className="rounded-full">
        {BoardUserStatusMapping[status as keyof typeof BoardUserStatusMapping]}
      </Button>
    );
  }

  return null;
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
        variant: "default",
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
