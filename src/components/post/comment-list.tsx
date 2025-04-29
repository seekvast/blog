import * as React from "react";
import type { Post } from "@/types/discussion";
import { CommentItem } from "@/components/post/comment-item";
import { PostForm } from "@/validations/post";
import { Loading } from "@/components/ui/loading";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserRound } from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";

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
        <AuthGuard>
          {!isLocked && (
            <div className="flex items-start space-x-3 px-2 md:px-4 mt-4">
              <Avatar className="h-10 w-10 md:h-10 md:w-10 flex-shrink-0">
                <AvatarFallback>
                  <UserRound className="h-4 w-4 md:h-5 md:w-5" />
                </AvatarFallback>
              </Avatar>
              <div
                className="flex-1 p-3 border border-border rounded-md bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => comments.length > 0 && onReply(comments[0])}
              >
                <div className="text-sm text-muted-foreground">
                  说点什么吧...
                </div>
              </div>
            </div>
          )}
        </AuthGuard>
      </div>
    );
  }
);

CommentList.displayName = "CommentList";
