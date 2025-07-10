"use client";

import * as React from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { VotersList } from "@/components/post/voters-list";
import { useCompactNumberFormat } from "@/lib/utils/format";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useEmailVerificationGuard } from "@/hooks/use-email-verification-guard";
import { EmailVerificationRequiredFeature } from "@/config/email-verification";

export interface VoteButtonsProps {
  postId: number;
  upVotesCount: number;
  downVotesCount: number;
  userVote?: {
    vote: string;
  } | null;
  onVoteSuccess?: (postId: number, vote: "up" | "down", response: any) => void;
  onVoteError?: (postId: number, vote: "up" | "down", error: any) => void;
  showDownVotesThreshold?: number;
}

export function VoteButtons({
  postId,
  upVotesCount,
  downVotesCount,
  userVote,
  onVoteSuccess,
  onVoteError,
  showDownVotesThreshold = 5,
}: VoteButtonsProps) {
  const formatCompactNumber = useCompactNumberFormat();
  const [votersPopoverOpen, setVotersPopoverOpen] = React.useState(false);
  const { requireEmailVerification } = useEmailVerificationGuard();

  // 内部处理投票逻辑
  const { mutate: handleVote } = useMutation({
    mutationFn: (vote: "up" | "down") => api.posts.vote({ id: postId, vote }),

    // 成功回调
    onSuccess: (response, vote) => {
      // 调用外部成功回调
      if (onVoteSuccess) {
        onVoteSuccess(postId, vote, response);
      }
    },

    // 错误回调
    onError: (error, vote) => {
      // 调用外部错误回调
      if (onVoteError) {
        onVoteError(postId, vote, error);
      }
    },
  });

  const handleVoteClick = (vote: "up" | "down") => {
    requireEmailVerification(() => {
      handleVote(vote);
    }, EmailVerificationRequiredFeature.VOTE);
  };

  return (
    <div className="flex items-center gap-2 space-x-3 md:space-x-6">
      <div className="flex items-center space-x-2 cursor-pointer">
        <ThumbsUp
          className={cn(
            "h-4 w-4",
            userVote?.vote === "up" && "text-primary fill-primary"
          )}
          onClick={() => handleVoteClick("up")}
        />
        {upVotesCount > 0 && (
          <Popover open={votersPopoverOpen} onOpenChange={setVotersPopoverOpen}>
            <PopoverTrigger asChild>
              <button className="text-xs md:text-sm hover:text-primary">
                {formatCompactNumber(upVotesCount)}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <VotersList postId={postId} />
            </PopoverContent>
          </Popover>
        )}
      </div>
      <div
        className="flex items-center space-x-1 cursor-pointer"
        onClick={() => handleVoteClick("down")}
      >
        <ThumbsDown
          className={cn(
            "h-4 w-4",
            userVote?.vote === "down" && "text-destructive fill-destructive"
          )}
        />
        {downVotesCount > showDownVotesThreshold && (
          <span className="text-xs md:text-sm">
            {formatCompactNumber(downVotesCount)}
          </span>
        )}
      </div>
    </div>
  );
}
