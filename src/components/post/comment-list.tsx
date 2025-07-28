import * as React from "react";
import type { Discussion, Post } from "@/types/discussion";
import { CommentItem } from "@/components/post/comment-item";
import { PostForm } from "@/validations/post";
import { Loading } from "@/components/ui/loading";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserRound } from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Preview } from "@/components/editor/preview";
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
  // 新增预览相关属性
  showPreview?: boolean;
  previewContent?: string;
  previewUser?: any;
  replyTo?: Post | null;
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
    showPreview = false,
    previewContent = "",
    previewUser = null,
    replyTo = null,
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

          {/* 评论预览 - 即使没有评论也要显示 */}
          {showPreview && previewContent && previewUser && (
            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-start space-x-3 min-w-0">
                <Avatar className="h-8 w-8 md:h-12 md:w-12 flex-shrink-0">
                  <AvatarImage src={previewUser.avatar_url} />
                  <AvatarFallback>
                    {previewUser.nickname?.[0].toUpperCase() ||
                      previewUser.username?.[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className="flex justify-between w-full items-start">
                    <div className="flex items-baseline gap-2 text-xs md:text-sm text-muted-foreground min-w-0 flex-1 flex-wrap">
                      <span className="font-medium text-base truncate md:max-w-[20ch]">
                        {previewUser.nickname || previewUser.username}
                      </span>
                      <div className="flex items-center gap-2 flex-wrap">
                        {replyTo && (
                          <span className="text-primary flex-shrink-0">
                            回复 @{replyTo.user.nickname}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 text-sm md:text-base">
                    <Preview content={previewContent} />
                  </div>
                </div>
              </div>
            </div>
          )}
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

          {/* 评论预览 */}
          {showPreview && previewContent && previewUser && (
            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-start space-x-3 min-w-0">
                <Avatar className="h-8 w-8 md:h-12 md:w-12 flex-shrink-0">
                  <AvatarImage src={previewUser.avatar_url} />
                  <AvatarFallback>
                    {previewUser.nickname?.[0].toUpperCase() ||
                      previewUser.username?.[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className="flex justify-between w-full items-start">
                    <div className="flex items-baseline gap-2 text-xs md:text-sm text-muted-foreground min-w-0 flex-1 flex-wrap">
                      <span className="font-medium text-base truncate md:max-w-[20ch]">
                        {previewUser.nickname || previewUser.username}
                      </span>
                      <div className="flex items-center gap-2 flex-wrap">
                        {replyTo && (
                          <span className="text-primary flex-shrink-0">
                            回复 @{replyTo.user.nickname}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 text-sm md:text-base">
                    <Preview content={previewContent} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

CommentList.displayName = "CommentList";
