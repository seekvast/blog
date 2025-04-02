import * as React from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import {
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  Flag,
  AlertTriangle,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PostContent } from "@/components/post/post-content";
import { cn } from "@/lib/utils";
import type { Post } from "@/types/discussion";
import { ReportDialog } from "@/components/report/report-dialog";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CommentActions } from "@/components/post/comment-actions";

interface CommentListProps {
  comments: Post[];
  isLoading: boolean;
  onReply: (comment: Post) => void;
  onVote: (postId: number, vote: "up" | "down") => void;
}

// 单个评论组件，支持递归渲染子评论
const CommentItem = ({
  comment,
  onReply,
  onVote,
  level = 0,
}: {
  comment: Post;
  onReply: (comment: Post) => void;
  onVote: (postId: number, vote: "up" | "down") => void;
  level?: number;
}) => {
  return (
    <div
      id={`comment-${comment.id}`}
      className={cn("pt-2 pb-4 border-b", level > 0 && "border-b-0 pb-0")}
    >
      <div className="flex items-start space-x-3 px-2 md:px-4 min-w-0">
        <Link href={`/u/${comment.user.username}?hash=${comment.user.hashid}`}>
          <Avatar className="h-8 w-8 md:h-12 md:w-12 flex-shrink-0">
            <AvatarImage src={comment.user.avatar_url} />
            <AvatarFallback>{comment.user.nickname[0]}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex justify-between w-full items-center">
            <div className="flex items-center gap-2">
              <Link
                href={`/u/${comment.user.username}?hash=${comment.user.hashid}`}
              >
                <span className="font-medium text-base truncate">
                  {comment.user.nickname || comment.user.username}
                </span>
              </Link>
              {comment.parent_post && (
                <Link
                  href={`#comment-${comment.parent_post.id}`}
                  className="text-primary"
                >
                  @{comment.parent_post.user.username}{" "}
                </Link>
              )}
              <span className="text-gray-300">·</span>
              <span className="text-xs md:text-sm text-gray-500">
                {formatDistanceToNow(new Date(comment.created_at), {
                  addSuffix: true,
                  locale: zhCN,
                })}
              </span>
            </div>
            {comment.parent_id <= 0 && <span className="text-xs md:text-sm text-gray-500">
              #{comment.number}
            </span>}
          </div>

          <div className="mt-2 text-sm md:text-base">
            <PostContent post={comment} />
          </div>

          <div className="mt-3 flex justify-between items-center space-x-4 text-sm md:text-base text-gray-500">
            <div className="flex items-center gap-2 space-x-3 md:space-x-6">
              <div
                className="flex items-center space-x-1 cursor-pointer"
                onClick={() => onVote(comment.id, "up")}
              >
                <ThumbsUp
                  className={cn(
                    "h-4 w-4",
                    comment.user_voted?.vote === "up" &&
                      "text-primary fill-primary"
                  )}
                />
                <span className="text-xs md:text-sm">
                  {comment.up_votes_count}
                </span>
              </div>
              <div
                className="flex items-center space-x-1 cursor-pointer"
                onClick={() => onVote(comment.id, "down")}
              >
                <ThumbsDown
                  className={cn(
                    "h-4 w-4",
                    comment.user_voted?.vote === "down" &&
                      "text-destructive fill-destructive"
                  )}
                />
                <span className="text-xs md:text-sm">
                  {comment.down_votes_count}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                className="text-sm cursor-pointer hover:text-primary"
                onClick={() => onReply(comment)}
              >
                回复
              </button>
              <CommentActions comment={comment} />
            </div>
          </div>

          {/* 渲染子评论 */}
          {comment.children && comment.children.length > 0 && (
            <div className="mt-2 space-y-4 bg-gray-50 py-4 divide-y">
              {comment.children.map((childComment) => (
                <CommentItem
                  key={childComment.id}
                  comment={childComment}
                  onReply={onReply}
                  onVote={onVote}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const CommentList = React.memo(
  ({
    comments,
    isLoading,
    onReply,
    onVote
  }: CommentListProps) => {
    if (!comments || comments.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-sm md:text-base text-muted-foreground">
          暂无评论
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="space-y-2 md:space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={onReply}
              onVote={onVote}
            />
          ))}
        </div>
      </div>
    );
  }
);

CommentList.displayName = "CommentList";
