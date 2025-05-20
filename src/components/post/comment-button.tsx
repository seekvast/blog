import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useBoardPermission } from "@/hooks/use-board-permission";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Discussion } from "@/types";
import { useMemo } from "react";

interface CommentButtonProps {
  discussion: Discussion;
  isLocked?: boolean;
  isReply?: boolean;
  isSubmitting?: boolean;
  showEditor?: boolean;
  onClick?: () => void;
  className?: string;
  variant?: "button" | "text";
  size?: "default" | "sm" | "lg";
}

export function CommentButton({
  discussion,
  isLocked,
  isReply = false,
  isSubmitting,
  showEditor,
  onClick,
  className,
  variant = "button",
  size = "default",
}: CommentButtonProps) {
  const { canPost, statusText, status } = useBoardPermission({
    discussion,
  });

  // 按钮状态
  const buttonState = useMemo(() => {
    if (showEditor) {
      return {
        hidden: true,
        disabled: false,
        loading: false,
        text: "",
        tooltip: "",
      };
    }

    if (isSubmitting) {
      return {
        hidden: false,
        disabled: true,
        loading: true,
        text: "提交中...",
        tooltip: "正在提交评论",
      };
    }

    if (isLocked) {
      return {
        hidden: false,
        disabled: true,
        loading: false,
        text: "评论已关闭",
        tooltip: "该讨论已关闭评论",
      };
    }

    if (!canPost) {
      return {
        hidden: false,
        disabled: true,
        loading: false,
        text: statusText || "无权限评论",
        tooltip: statusText,
      };
    }

    return {
      hidden: false,
      disabled: false,
      loading: false,
      text: isReply ? "回复" : "评论",
      tooltip: isReply ? "发表回复" : "发表评论",
    };
  }, [showEditor, isSubmitting, isLocked, canPost, statusText, status]);

  if (buttonState.hidden) {
    return null;
  }

  const buttonContent = (
    <>
      {buttonState.loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {buttonState.text}
    </>
  );

  if (variant === "text") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={cn(
                "text-sm",
                buttonState.disabled
                  ? "cursor-not-allowed text-muted-foreground"
                  : "cursor-pointer hover:text-primary",
                className
              )}
              onClick={onClick}
              disabled={buttonState.disabled}
            >
              {buttonContent}
            </button>
          </TooltipTrigger>
          {buttonState.tooltip && (
            <TooltipContent>
              <p>{buttonState.tooltip}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={buttonState.disabled ? "secondary" : "default"}
            size={size}
            className={cn("w-full", className)}
            onClick={onClick}
            disabled={buttonState.disabled}
          >
            {buttonContent}
          </Button>
        </TooltipTrigger>
        {buttonState.tooltip && (
          <TooltipContent>
            <p>{buttonState.tooltip}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
