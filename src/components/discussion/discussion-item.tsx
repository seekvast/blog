"use client";

import * as React from "react";
import { useState, useCallback } from "react";
import Link from "next/link";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { formatDate, fromNow } from "@/lib/dayjs";

import {
  ThumbsUp,
  MessageSquare,
  Tag,
  Heart,
  Lock,
  BookmarkCheck,
  Pin,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DiscussionPreview } from "@/components/post/discussion-preview";
import type { Discussion } from "@/types/discussion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { debounce } from "@/lib/utils";
import { useCompactNumberFormat } from "@/lib/utils/format";
import { DiscussionActions } from "@/components/post/discussion-actions";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DiscussionItemProps {
  discussion: Discussion;
  displayMode: "grid" | "list";
  isLastItem?: boolean;
  onChange?: (deletedSlug: string) => void;
}

export const DiscussionItem = React.forwardRef<
  HTMLElement,
  DiscussionItemProps
>(({ discussion, displayMode, isLastItem, onChange }, ref) => {
  const { requireAuth } = useRequireAuth();
  const [isVoted, setIsVoted] = useState(discussion.user_voted?.vote === "up");
  const [isVoting, setIsVoting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const formatCompactNumber = useCompactNumberFormat();

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
    [voteMutation]
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
    <article ref={ref} className={cn("py-4 w-full")}>
      <div className="flex space-x-3 w-full">
        {/* 作者头像 */}
        <Link
          href={`/u/${discussion.user.username}?hashid=${discussion.user.hashid}`}
        >
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage
              src={discussion.user.avatar_url}
              alt={discussion.user.nickname}
            />
            <AvatarFallback>
              {discussion.user.nickname[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="min-w-0 flex-1 w-full">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <Link
                href={`/d/${discussion.slug}?bid=${discussion.board_id}`}
                className={cn(
                  "min-w-0 w-0 text-xl font-medium text-foreground hover:text-primary block w-full overflow-hidden text-ellipsis line-clamp-3 md:line-clamp-2 break-words",
                  discussion.discussion_user && "text-muted-foreground"
                )}
                style={{
                  display: "-webkit-box",
                }}
              >
                <h2 className="w-full">{discussion.title}</h2>
              </Link>
              {/* {discussion.is_private === 1 && (
                <Badge variant="secondary">私密</Badge>
              )} */}
            </div>

            <div className="flex items-center space-x-2 cursor-pointer text-muted-foreground">
              {discussion.is_sticky === 1 && (
                <Pin className="h-4 w-4 text-red-500" />
              )}
              {discussion.is_locked === 1 && <Lock className="h-4 w-4" />}
              {discussion?.discussion_user?.subscription === "follow" && (
                <Heart className="h-4 w-4 text-primary" />
              )}
              {discussion?.discussion_user?.is_bookmarked === "yes" && (
                <BookmarkCheck className="h-4 w-4" />
              )}

              <DiscussionActions
                discussion={discussion}
                onChange={() => onChange?.(discussion.slug)}
              />
            </div>
          </div>

          <Link
            href={`/d/${discussion.slug}?bid=${discussion.board_id}`}
            className="mt-1"
          >
            <DiscussionPreview
              content={discussion.main_post.content}
              displayMode={displayMode}
              className={cn(
                discussion.discussion_user && "text-muted-foreground"
              )}
            />
          </Link>

          <div className="mt-3 flex items-center space-x-2 lg:space-x-4 text-sm text-center">
            <div className="flex items-center gap-1">
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
              {discussion.up_votes > 0 && (
                <span className="text-sm text-muted-foreground">
                  {formatCompactNumber(discussion.up_votes)}
                </span>
              )}
            </div>
            <Link
              href={`/d/${discussion.slug}?bid=${discussion.board_id}#comment`}
              className="flex items-center space-x-1 text-muted-foreground"
            >
              <MessageSquare className="h-4 w-4 text-sm cursor-pointer" />
              <span>{formatCompactNumber(discussion.comment_count)}</span>
            </Link>

            <div className="flex items-center space-x-1 text-muted-foreground">
              <Popover>
                <PopoverTrigger asChild>
                  <button className="hover:text-primary">
                    {fromNow(discussion.created_at)}
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="p-2 w-auto min-w-[320px]"
                  side="top"
                  align="center"
                  sideOffset={5}
                  avoidCollisions={true}
                >
                  <div className="space-y-2 text-muted-foreground">
                    <div className="text-xs font-medium">
                      <span className="font-bold">发表 #1 </span>
                      {formatDate(
                        discussion.created_at,
                        "YYYY年M月D日 dddd HH:mm:ss"
                      )}
                    </div>
                    <div className="flex flex-col space-y-2 w-full">
                      <div className="relative w-full">
                        <input
                          type="text"
                          readOnly
                          value={`${window.location.origin}/d/${discussion.slug}`}
                          className="w-full text-xs p-2 rounded bg-background pr-16"
                          onClick={(e) => e.currentTarget.select()}
                        />
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <span>
                来自{" "}
                <Link
                  href={`/b/${discussion.board?.slug}`}
                  className="inline-block max-w-[8ch] lg:max-w-[20ch] truncate align-bottom"
                >
                  {discussion.board?.name}
                </Link>
              </span>
              <Link
                href={`/b/${discussion.board?.slug}?child=${discussion.board_child?.id}`}
                className="inline-flex items-center"
              >
                <Tag className="h-4 w-4 text-sm mr-1" />
                <span>{discussion.board_child?.name}</span>
              </Link>
            </div>
            {discussion.main_post.editor && (
              <Popover>
                <PopoverTrigger asChild>
                  <div>
                    <span className="flex-shrink-0 mx-2 text-gray-300">·</span>
                    <button className="text-muted-foreground hover:text-primary">
                      已编辑
                    </button>
                  </div>
                </PopoverTrigger>
                <PopoverContent
                  className="p-3 w-full"
                  side="top"
                  align="center"
                  sideOffset={5}
                >
                  <div className="space-y-2 text-muted-foreground">
                    <div className="text-xs space-y-1">
                      {discussion.main_post.editor.nickname ||
                        discussion.main_post.editor.username}{" "}
                      编辑于{" "}
                      {discussion.main_post.edited_at
                        ? formatDate(
                            discussion.main_post.edited_at,
                            "YYYY年M月D日"
                          )
                        : "未知"}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      </div>
    </article>
  );
});
