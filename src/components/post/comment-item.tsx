"use client";

import * as React from "react";
import Link from "next/link";
import { formatDate, fromNow } from "@/lib/dayjs";
import {
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Reply,
  MinusCircle,
  UserRound,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PostContent } from "@/components/post/post-content";
import { cn } from "@/lib/utils";
import type { Post } from "@/types/discussion";
import { CommentActions } from "@/components/post/comment-actions";
import { AuthGuard } from "@/components/auth/auth-guard";
import { EditReply } from "@/components/post/edit-reply";
import { PostForm } from "@/validations/post";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CommentButton } from "@/components/post/comment-button";
import type { Discussion } from "@/types/discussion";
import { VoteButtons } from "@/components/common/vote-buttons";

interface CommentItemProps {
  discussion: Discussion;
  comment: Post;
  onReply: (comment: Post) => void;
  onSubmitReply?: (replyForm: PostForm) => void;
  onEditComment?: (data: { id: number; content: string }) => void;
  onEdit?: (comment: Post) => void;
  isLocked?: boolean;
  queryKey?: string | string[];
  level?: number;
}

export const CommentItem = ({
  discussion,
  comment,
  onReply,
  onSubmitReply,
  onEditComment,
  onEdit,
  isLocked = false,
  queryKey,
  level = 0,
}: CommentItemProps) => {

  const [isEditing, setIsEditing] = React.useState(false);
  const [isReplying, setIsReplying] = React.useState(false);

  const hasManuallyCollapsed = React.useRef(false);
  const [showChildren, setShowChildren] = React.useState(true);
  const [visibleChildrenCount, setVisibleChildrenCount] = React.useState(15);

  const handleToggleChildren = (show: boolean) => {
    if (!show) {
      hasManuallyCollapsed.current = true;
    }
    setShowChildren(show);
  };
  const [editContent, setEditContent] = React.useState(comment.raw_content);
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
    onReply(comment);
  };

  const handleEdit = (comment: Post) => {
    if (onEdit) {
      onEdit(comment);
    } else {
      setIsEditing(true);
      setEditContent(comment.raw_content);

      setTimeout(() => {
        if (editRef.current) {
          editRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 100);
    }
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

    if (onEditComment) {
      onEditComment({
        id: comment.id,
        content: editContent,
      });
    } else {
      editMutation.mutate({
        id: comment.id,
        content: editContent,
      });
    }
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
            <AvatarFallback>
              {comment.user.nickname[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex justify-between w-full items-center">
            <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
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
              <span>{fromNow(comment.created_at)}</span>
              {comment.editor && (
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="hover:text-primary">已编辑</button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="p-3 w-full"
                    side="top"
                    align="center"
                    sideOffset={5}
                  >
                    <div className="space-y-2 text-muted-foreground">
                      <div className="text-xs space-y-1">
                        {comment.editor.nickname || comment.editor.username}{" "}
                        编辑于{" "}
                        {comment.edited_at
                          ? formatDate(comment.edited_at, "YYYY年M月D日")
                          : "未知"}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
            {comment.parent_id <= 0 && (
              <span className="text-xs md:text-sm text-muted-foreground">
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
              </>
            )}
          </div>

          {!isEditing && (
            <div className="mt-3 flex justify-between items-center space-x-4 text-sm md:text-base text-muted-foreground">
              <VoteButtons
                postId={comment.id}
                upVotesCount={comment.up_votes_count}
                downVotesCount={comment.down_votes_count}
                userVote={comment.user_voted}
                onVoteSuccess={(postId, vote, response) => {
                  if (queryKey) {
                    queryClient.invalidateQueries({ queryKey });
                  }
                }}
              />

              <div className="flex items-center space-x-3">
                <AuthGuard>
                  <CommentButton
                    discussion={discussion}
                    isLocked={isLocked}
                    isReply={true}
                    isSubmitting={isReplying}
                    showEditor={isReplying}
                    onClick={handleReplyClick}
                    variant="text"
                    size="sm"
                  />
                </AuthGuard>
                <CommentActions comment={comment} onEdit={handleEdit} />
              </div>
            </div>
          )}

          {/* 渲染子评论 */}
          {comment.children && comment.children.length > 0 && (
            <div className="mt-2 space-y-4 py-4">
              {/* 只有在用户手动折叠过的情况下才显示折叠状态 */}
              {hasManuallyCollapsed.current && !showChildren ? (
                <div className="text-center">
                  <button
                    onClick={() => handleToggleChildren(true)}
                    className="text-sm text-primary hover:text-primary/80 font-medium"
                  >
                    查看 {comment.children.length} 条回复
                  </button>
                </div>
              ) : (
                <>
                  {comment.children
                    .slice(0, visibleChildrenCount)
                    .map((childComment) => (
                      <CommentItem
                        key={childComment.id}
                        discussion={discussion}
                        comment={childComment}
                        onReply={onReply}
                        onSubmitReply={onSubmitReply}
                        onEditComment={onEditComment}
                        onEdit={onEdit}
                        level={level + 1}
                        isLocked={isLocked}
                        queryKey={queryKey}
                      />
                    ))}

                  <div className="flex justify-between items-center mt-4 px-2">
                    {comment.children.length > visibleChildrenCount ? (
                      <button
                        onClick={() =>
                          setVisibleChildrenCount((prev) => prev + 15)
                        }
                        className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                      >
                        <span>
                          查看剩余{" "}
                          {comment.children.length - visibleChildrenCount}{" "}
                          条回复
                        </span>
                      </button>
                    ) : (
                      <div></div>
                    )}

                    <button
                      onClick={() => handleToggleChildren(false)}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                    >
                      <MinusCircle className="h-3.5 w-3.5" />
                      <span>收起</span>
                    </button>
                  </div>
                  {!isLocked && (
                    <div className="flex items-start space-x-3 px-2 md:px-4 mt-4">
                      <Avatar className="h-8 w-8 md:h-12 md:w-12 flex-shrink-0">
                        <AvatarFallback>
                          <UserRound className="h-4 w-4 md:h-5 md:w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className="flex-1 p-3 border border-border rounded-md bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => onReply(comment)}
                      >
                        <div className="text-sm text-muted-foreground">
                          点击回复...
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
