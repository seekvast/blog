import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Check, Clock, Users } from "lucide-react";
import { PollVotersDialog } from "./poll-voters-dialog";
import { Poll, PollOption } from "@/types/discussion";
import { useEffect } from "react";
import { api } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import type { Discussion } from "@/types";
import { useEmailVerificationGuard } from "@/hooks/use-email-verification-guard";
import { EmailVerificationRequiredFeature } from "@/config/email-verification";

interface PollContentProps {
  discussion: Discussion;
}

export function PollContent({ discussion }: PollContentProps) {
  if (!discussion.poll) {
    return null;
  }

  const [poll, setPoll] = React.useState(discussion.poll);
  const initialPoll = discussion.poll;

  const hasVotePermission = true;

  const [selectedOptions, setSelectedOptions] = React.useState<number[]>(
    initialPoll.user_voted?.options || []
  );
  const [isVoted, setIsVoted] = React.useState(
    initialPoll.user_voted && initialPoll.user_voted.options.length > 0
  );
  const isMultiple = poll.is_multiple === 1;
  const isTimed = poll.is_timed === 1;
  const now = new Date();
  const startTime = new Date(poll.start_time);
  const endTime = new Date(poll.end_time);
  const isStarted = !isTimed || (isTimed && now >= startTime);
  const isEnded = isTimed && now >= endTime;
  const totalVotes = poll.votes_count;

  const handleVoteChange = (optionId: number) => {
    if (isMultiple) {
      setSelectedOptions((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedOptions([optionId]);
    }
  };

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { requireEmailVerification } = useEmailVerificationGuard();

  const handleSubmitVote = async () => {
    if (selectedOptions.length > 0) {
      requireEmailVerification(async () => {
        try {
          const response = await api.discussions.votePoll({
            slug: poll.discussion_slug,
            poll_id: poll.id,
            options: selectedOptions,
          });
          queryClient.invalidateQueries({
            queryKey: ["discussion", poll.discussion_slug],
          });
          toast({
            title: "投票成功",
            variant: "default",
          });
          if (response) {
            setPoll(response);
            setIsVoted(true);
          }
        } catch (error) {
          toast({
            title: "投票失败",
            description: "请稍后重试",
            variant: "destructive",
          });
        }
      }, EmailVerificationRequiredFeature.VOTE);
    }
  };

  const [showVoters, setShowVoters] = React.useState(false);

  useEffect(() => {
    if (poll.user_voted) {
      setSelectedOptions(poll.user_voted.options);
      setIsVoted(true);
    }
  }, [poll]);

  return (
    <div className="border rounded-lg p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 text-sm">
        {/* 左侧信息 */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
          {isMultiple && (
            <div className="flex items-center">
              <Check className="w-4 h-4 mr-1 flex-shrink-0" />
              <span>多选</span>
              <span className="flex-shrink-0 mx-2 text-gray-300 sm:inline hidden">
                ·
              </span>
            </div>
          )}
          {poll.show_voter === 1 && (
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1 flex-shrink-0" />
              <button
                className="hover:text-blue-600 transition-colors"
                onClick={() => setShowVoters(true)}
              >
                可查看投票人
              </button>
              <span className="flex-shrink-0 mx-2 text-gray-300 sm:inline hidden">
                ·
              </span>
            </div>
          )}
          {isTimed && (
            <div className="flex items-center col-span-2 sm:col-span-1">
              <Clock className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="truncate">
                截止日期 {endTime.toLocaleString()}
              </span>
            </div>
          )}
        </div>
        {/* 右侧总投票数 */}
        <div className="text-sm text-muted-foreground">
          有 {totalVotes} 人参与投票
        </div>
      </div>

      <div className="space-y-3">
        {isMultiple ? (
          poll.options.map((option) => {
            const percentage =
              totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
            return (
              <div
                key={option.id}
                className="relative w-full border rounded-md"
              >
                <div
                  className="absolute inset-0 bg-muted"
                  style={{ width: `${percentage}%` }}
                />
                <div className="relative flex items-center space-x-2 p-2">
                  <Checkbox
                    id={`option-${option.id}`}
                    checked={selectedOptions.includes(option.id)}
                    onCheckedChange={() => handleVoteChange(option.id)}
                    disabled={
                      isEnded || !isStarted || isVoted || !hasVotePermission
                    }
                  />
                  <label
                    htmlFor={`option-${option.id}`}
                    className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {option.option}
                  </label>
                  <span className="text-sm text-muted-foreground">
                    {percentage.toFixed(0)}% ({option.votes})
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <RadioGroup
            value={selectedOptions[0]?.toString()}
            onValueChange={(value) => handleVoteChange(parseInt(value))}
            disabled={isEnded || !isStarted || isVoted || !hasVotePermission}
          >
            {poll.options.map((option) => {
              const percentage =
                totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
              return (
                <div
                  key={option.id}
                  className="relative w-full border rounded-md"
                >
                  <div
                    className="absolute inset-0 bg-muted  "
                    style={{ width: `${percentage}%` }}
                  />
                  <div className="relative flex items-center space-x-2 p-2">
                    <RadioGroupItem
                      value={option.id.toString()}
                      id={`option-${option.id}`}
                    />
                    <label
                      htmlFor={`option-${option.id}`}
                      className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {option.option}
                    </label>
                    <span className="text-sm text-muted-foreground">
                      {percentage.toFixed(0)}% ({option.votes})
                    </span>
                  </div>
                </div>
              );
            })}
          </RadioGroup>
        )}
      </div>

      <div className="mt-4 flex justify-center">
        <Button
          size="sm"
          className="w-auto"
          onClick={handleSubmitVote}
          disabled={
            selectedOptions.length === 0 ||
            isEnded ||
            !isStarted ||
            isVoted ||
            !hasVotePermission
          }
        >
          {isEnded ? "结束投票" : isVoted ? "已投票" : "确认投票"}
        </Button>
      </div>

      {poll.show_voter === 1 && (
        <PollVotersDialog
          open={showVoters}
          onOpenChange={setShowVoters}
          pollId={poll.id}
          discussionSlug={poll.discussion_slug}
        />
      )}
    </div>
  );
}
