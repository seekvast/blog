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
import { EditReply } from "@/components/post/edit-reply";
import { PostForm } from "@/validations/post";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

interface CommentItemProps {
  comment: Post;
  onReply: (comment: Post) => void;
  onVote: (postId: number, vote: "up" | "down") => void;
  onSubmitReply?: (replyForm: PostForm) => void;
  level?: number;
}

export const CommentItem = ({
  comment,
  onReply,
  onVote,
  onSubmitReply,
  level = 0,
}: CommentItemProps) => {
  const [replyEditorVisiable, setReplyEditorVisiable] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editContent, setEditContent] = React.useState(comment.raw_content);
  const [replyForm, setReplyForm] = React.useState<PostForm>({
    slug: "",
    content: "",
    attachments: [],
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const editRef = React.useRef<HTMLDivElement>(null);

  const editMutation = useMutation({
    mutationFn: (data: { id: number; content: string }) =>
      api.posts.update({ id: data.id, content: data.content }),
    onSuccess: () => {
      toast({
        title: "编辑成功",
        description: "评论已更新",
      });
      queryClient.invalidateQueries({
        queryKey: [
          "discussion-posts",
          comment.discussion_slug,
          comment.board_id,
        ],
      });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: "编辑失败",
        description: error.message,
        variant: "destructive",
      });
    },
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

  const handleEdit = (comment: Post) => {
    setIsEditing(true);
    setEditContent(comment.raw_content);

    // 使用setTimeout确保DOM已更新后再滚动
    setTimeout(() => {
      if (editRef.current) {
        editRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.raw_content);
  };

  const handleSaveEdit = () => {
    if (!editContent.trim()) {
      toast({
        title: "内容不能为空",
        description: "请输入评论内容",
        variant: "destructive",
      });
      return;
    }

    editMutation.mutate({
      id: comment.id,
      content: editContent,
    });
  };

  return (
    <div
      id={`comment-${comment.id}`}
      className={cn("pt-2 pb-4 border-b", level > 0 && "border-b-0 pb-0")}
    >
      <div className="flex items-start space-x-3 px-2 md:px-4 min-w-0">
        <Link
          href={`/u/${comment.user.username}?hashid=${comment.user.hashid}`}
        >
          <Avatar className="h-8 w-8 md:h-12 md:w-12 flex-shrink-0">
            <AvatarImage src={comment.user.avatar_url} />
            <AvatarFallback>{comment.user.nickname[0]}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex justify-between w-full items-center">
            <div className="flex items-center gap-2">
              <Link
                href={`/u/${comment.user.username}?hashid=${comment.user.hashid}`}
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

          <div className="mt-2 text-sm md:text-base" ref={editRef}>
            {isEditing ? (
              <EditReply
                comment={comment}
                onCancel={handleCancelEdit}
                onSuccess={() => setIsEditing(false)}
              />
            ) : (
              <>
                <PostContent post={comment} />

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
              </>
            )}
          </div>

          {!isEditing && (
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
                <CommentActions comment={comment} onEdit={handleEdit} />
              </div>
            </div>
          )}

          {/* 渲染子评论 */}
          {comment.children && comment.children.length > 0 && (
            <div className="mt-2 space-y-4 bg-subtle py-4 divide-y">
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
