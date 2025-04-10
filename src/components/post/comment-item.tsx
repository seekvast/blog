"use client";

import * as React from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PostContent } from "@/components/post/post-content";
import { cn } from "@/lib/utils";
import type { Post } from "@/types/discussion";
import { CommentActions } from "@/components/post/comment-actions";
import { AuthGuard } from "@/components/auth/auth-guard";
import { ReplyEditor } from "@/components/post/reply-editor";
import { PostForm } from "@/validations/post";

interface CommentItemProps {
  comment: Post;
  onReply: (comment: Post) => void;
  onVote: (postId: number, vote: "up" | "down") => void;
  onSubmitReply?: (replyForm: PostForm) => void;
  level?: number;
}

// 单个评论组件，支持递归渲染子评论
export const CommentItem = ({
  comment,
  onReply,
  onVote,
  onSubmitReply,
  level = 0,
}: CommentItemProps) => {
  const [replyEditorVisiable, setReplyEditorVisiable] = React.useState(false);
  const [replyForm, setReplyForm] = React.useState<PostForm>({
    slug: "",
    content: "",
    attachments: [],
  });

  const handleReplyClick = () => {
    setReplyEditorVisiable(true);
  };

  const handleCancelReply = () => {
    setReplyEditorVisiable(false);
    setReplyForm({
      slug: "",
      content: "",
      attachments: [],
    });
  };

  const handleSubmitReply = (replyForm: PostForm) => {
    if (onSubmitReply) {
      onSubmitReply(replyForm);
    }
    setReplyEditorVisiable(false);
    setReplyForm({
      slug: "",
      content: "",
      attachments: [],
    });
  };

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
            {comment.parent_id <= 0 && (
              <span className="text-xs md:text-sm text-gray-500">
                #{comment.number}
              </span>
            )}
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
                {comment.up_votes_count > 0 && (
                  <span className="text-xs md:text-sm">
                    {comment.up_votes_count}
                  </span>
                )}
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
                {comment.down_votes_count > 5 && (
                  <span className="text-xs md:text-sm">
                    {comment.down_votes_count}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <AuthGuard
                fallback={
                  <button
                    className="text-sm cursor-pointer hover:text-primary"
                    onClick={() => onReply(comment)}
                  >
                    回复
                  </button>
                }
              >
                <button
                  className="text-sm cursor-pointer hover:text-primary"
                  onClick={handleReplyClick}
                >
                  回复
                </button>
              </AuthGuard>
              <CommentActions comment={comment} />
            </div>
          </div>

          {/* 回复框 */}
          {replyEditorVisiable && (
            <div className="mt-4">
              <AuthGuard>
                <ReplyEditor
                  comment={comment}
                  onCancel={handleCancelReply}
                  onSubmit={handleSubmitReply}
                />
              </AuthGuard>
            </div>
          )}

          {/* 渲染子评论 */}
          {comment.children && comment.children.length > 0 && (
            <div className="mt-2 space-y-4 bg-gray-50 py-4 divide-y">
              {comment.children.map((childComment) => (
                <CommentItem
                  key={childComment.id}
                  comment={childComment}
                  onReply={onReply}
                  onVote={onVote}
                  onSubmitReply={onSubmitReply}
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
