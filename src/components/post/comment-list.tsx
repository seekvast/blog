import * as React from "react";
import type { Post } from "@/types/discussion";
import { CommentItem } from "@/components/post/comment-item";
import { PostForm } from "@/validations/post";
import { Loading } from "@/components/ui/loading";

interface CommentListProps {
  comments: Post[];
  isLoading: boolean;
  onReply: (comment: Post) => void;
  onVote: (postId: number, vote: "up" | "down") => void;
  onSubmitReply?: (replyForm: PostForm) => void;
  onEditComment?: (data: { id: number; content: string }) => void;
  onEdit?: (comment: Post) => void;
  isLocked?: boolean;
}

export const CommentList = React.memo(
  ({
    comments,
    isLoading,
    onReply,
    onVote,
    onSubmitReply,
    onEditComment,
    onEdit,
    isLocked,
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
