"use client";

import * as React from "react";
import { useState, useCallback } from "react";
import Link from "next/link";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useAuth } from "../providers/auth-provider";

import {
  ThumbsUp,
  MessageSquare,
  MoreHorizontal,
  Edit,
  Trash2,
  Flag,
  AlertTriangle,
  PinIcon,
  FolderEdit,
  Lock,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DiscussionPreview } from "@/components/post/discussion-preview";
import type { Discussion } from "@/types/discussion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReportDialog } from "@/components/report/report-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { debounce } from "@/lib/utils";
import { DiscussionActions } from "@/components/post/discussion-actions";

interface DiscussionItemProps {
  discussion: Discussion;
  displayMode: "grid" | "list";
  isLastItem?: boolean;
}

export const DiscussionItem = React.forwardRef<
  HTMLElement,
  DiscussionItemProps
>(({ discussion, displayMode, isLastItem }, ref) => {
  const { requireAuth } = useRequireAuth();
  const { user } = useAuth();
  const [isVoted, setIsVoted] = useState(discussion.user_voted?.vote === "up");
  const [isVoting, setIsVoting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isAuthor = user?.hashid === discussion.user.hashid;
  // 点赞 mutation
  const voteMutation = useMutation({
    mutationFn: async () => {
      return await api.posts.vote({ id: discussion.first_post_id, vote: "up" });
    },
    onSuccess: () => {
      setIsVoted(!isVoted);
      setIsVoting(false);
      // 更新讨论列表缓存
      queryClient.invalidateQueries({ queryKey: ["discussions"] });
    },
    onError: (error) => {
      setIsVoting(false);
      toast({
        title: "点赞失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive",
      });
    },
  });

  // 使用 useCallback 和 debounce 创建防抖的点赞处理函数
  const debouncedVote = useCallback(
    debounce(() => {
      requireAuth(() => {
        if (!isVoting) {
          setIsVoting(true);
          voteMutation.mutate();
        }
      });
    }, 500),
    [isVoting, voteMutation]
  );

  // 处理点赞点击
  const handleVote = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isVoting) {
      toast({
        title: "操作过于频繁",
        description: "请稍后再试",
        variant: "destructive",
      });
      return;
    }
    debouncedVote();
  };

  return (
    <article ref={ref} className="py-4 w-full">
      <div className="flex space-x-3 w-full">
        {/* 作者头像 */}
        <Link href={`/u/${discussion.user.username}`}>
          <Avatar className="h-10 w-10 lg:h-14 lg:w-14 flex-shrink-0">
            <AvatarImage
              src={discussion.user.avatar_url}
              alt={discussion.user.username}
            />
            <AvatarFallback>{discussion.user.username[0]}</AvatarFallback>
          </Avatar>
        </Link>

        <div className="min-w-0 flex-1 w-full">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <h2 className="min-w-0 flex-1 w-0">
                <Link
                  href={`/d/${discussion.slug}`}
                  className="text-xl font-medium text-foreground hover:text-primary line-clamp-1 block w-full overflow-hidden text-ellipsis"
                >
                  {discussion.title}
                </Link>
              </h2>
              {discussion.is_private === 1 && (
                <Badge variant="secondary">私密</Badge>
              )}
              {discussion.is_sticky === 1 && (
                <Badge variant="secondary" className="bg-blue-50 text-blue-600">
                  置顶
                </Badge>
              )}
            </div>

            <DiscussionActions discussion={discussion} isAuthor={isAuthor} />
          </div>

          <div className="mt-1">
            <DiscussionPreview
              content={discussion.main_post.content}
              displayMode={displayMode}
            />
          </div>

          <div className="mt-3 flex items-center space-x-2 lg:space-x-4 text-sm text-center">
            <div className="flex items-center gap-2">
              <div className="relative group">
                <ThumbsUp
                  className={cn(
                    "h-4 w-4 cursor-pointer transition-colors",
                    isVoted
                      ? "text-primary fill-primary"
                      : "text-muted-foreground hover:text-primary",
                    voteMutation.isPending && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={handleVote}
                />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {isVoted ? "取消点赞" : "点赞"}
                </div>
              </div>
              <span className="text-sm text-muted-foreground">
                {discussion.votes_count}
              </span>
            </div>
            <Link
              href={`/d/${discussion.slug}#comment`}
              className="flex items-center space-x-1 text-muted-foreground"
            >
              <MessageSquare className="h-4 w-4 text-sm cursor-pointer" />
              <span>{discussion.comment_count}</span>
            </Link>

            <div className="flex items-center space-x-1 text-muted-foreground">
              <span>{discussion.diff_humans}</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <span>
                来自
                <span className="inline-block max-w-[8ch] lg:max-w-[20ch] truncate align-bottom">
                  {discussion.board?.name}
                </span>
              </span>
              <span>#{discussion.board_child?.name}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
});
