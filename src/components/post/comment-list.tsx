import * as React from "react";
import type { Discussion, Post } from "@/types/discussion";
import { CommentItem } from "@/components/post/comment-item";
import { PostForm } from "@/validations/post";
import { Loading } from "@/components/ui/loading";
import { UserRound } from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";

interface CommentListProps {
  discussion: Discussion;
  comments: Post[];
  isLoading: boolean;
  onReply: (comment: Post) => void;
  onSubmitReply?: (replyForm: PostForm) => void;
  onEditComment?: (data: { id: number; content: string }) => void;
  onEdit?: (comment: Post) => void;
  isLocked?: boolean;
  queryKey?: string | string[];
}

export const CommentList = React.memo(
  ({
    discussion,
    comments,
    isLoading,
    onReply,
    onSubmitReply,
    onEditComment,
    onEdit,
    isLocked,
    queryKey,
  }: CommentListProps) => {
    if (!comments.length && isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <Loading size="md" />
        </div>
      );
    }

    if (!comments || comments.length === 0) {
      return (
        <div className="flex flex-col">
          <span className="flex justify-center py-8 text-sm md:text-base text-muted-foreground">
            暂无评论
          </span>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="space-y-2 md:space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              discussion={discussion}
              comment={comment}
              onReply={onReply}
              queryKey={queryKey}
              onSubmitReply={onSubmitReply}
              onEditComment={onEditComment}
              onEdit={onEdit}
              isLocked={isLocked}
            />
          ))}
        </div>
      </div>
    );
  }
);

CommentList.displayName = "CommentList";
