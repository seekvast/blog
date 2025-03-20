"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useDiscussionStore } from "@/store/discussion";
import { useAuth } from "@/components/providers/auth-provider";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import type { Discussion, Pagination } from "@/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Star, Bookmark } from "lucide-react";
import { useLoginModal } from "@/components/providers/login-modal-provider";
import { PostContent } from "@/components/post/post-content";
import { api } from "@/lib/api";
import { Preview } from "@/components/editor/Preview";
import { toast } from "@/components/ui/use-toast";
import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { cn, debounce } from "@/lib/utils";
import type { Post } from "@/types/discussion";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { Button } from "@/components/ui/button";
import { CommentList } from "@/components/post/comment-list";
import { CommentEditor } from "@/components/post/comment-editor";
import { ErrorBoundary } from "@/components/error/error-boundary";
import Link from "next/link";
interface DiscussionDetailProps {
  initialDiscussion: Discussion;
}

export function DiscussionDetail({ initialDiscussion }: DiscussionDetailProps) {
  const params = useParams();
  const slug = params?.slug as string;
  if (!slug) {
    return <div>Invalid discussion URL</div>;
  }

  const { user } = useAuth();
  const { requireAuth } = useRequireAuth();
  const { openLoginModal } = useLoginModal();
  const { currentDiscussion, setDiscussion } = useDiscussionStore();

  const [commentContent, setCommentContent] = React.useState("");
  const [replyTo, setReplyTo] = React.useState<Post | null>(null);
  const editorRef = React.useRef<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(
    initialDiscussion?.discussion_user?.is_bookmarked === "yes"
  );
  const [isFollowed, setIsFollowed] = useState(
    initialDiscussion?.discussion_user?.subscription === "follow"
  );

  const queryClient = useQueryClient();

  // 使用 React Query 获取评论列表
  const {
    data: comments = {
      items: [],
      code: 0,
      total: 0,
      per_page: 0,
      current_page: 0,
      last_page: 0,
      message: "",
    },
    isLoading,
    error: commentsError,
  } = useQuery<Pagination<Post>>({
    queryKey: ["discussion-posts", slug, initialDiscussion?.board_id],
    queryFn: async () => {
      try {
        return await api.discussions.posts({
          slug,
          board_id: initialDiscussion.board_id,
        });
      } catch (error) {
        console.error("Failed to fetch comments:", error);
        throw error;
      }
    },
    enabled: !!currentDiscussion,
    staleTime: 60 * 1000,
  });

  // 使用 useMutation 优化书签操作
  const bookmarkMutation = useMutation({
    mutationFn: () =>
      api.discussions.saveBookmark({
        slug: currentDiscussion?.slug,
        is_bookmarked: isBookmarked ? "no" : "yes",
      }),
    onMutate: () => {
      setIsBookmarked((prev) => !prev);
    },
    onError: (error) => {
      setIsBookmarked((prev) => !prev);
      toast({
        title: "操作失败",
        description: "书签操作失败，请稍后重试",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: isBookmarked ? "已取消收藏" : "已收藏",
        variant: "default",
      });
    },
  });

  // 使用 useMutation 优化关注操作
  const followMutation = useMutation({
    mutationFn: () =>
      api.discussions.saveFollow({
        slug: currentDiscussion?.slug,
      }),
    onMutate: () => {
      setIsFollowed((prev) => !prev);
    },
    onError: (error) => {
      setIsFollowed((prev) => !prev);
      toast({
        title: "操作失败",
        description: "关注操作失败，请稍后重试",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: isFollowed ? "已取消关注" : "已关注",
        variant: "default",
      });
    },
  });

  const voteMutation = useMutation({
    mutationFn: ({ postId, vote }: { postId: number; vote: "up" | "down" }) =>
      api.posts.vote({
        id: postId,
        vote,
      }),
    onSuccess: (_, { postId, vote }) => {
      queryClient.setQueryData<Pagination<Post>>(
        ["discussion-posts", slug, initialDiscussion.board_id],
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            items: oldData.items.map((post) => {
              if (post.id === postId) {
                if (post.user_voted?.vote === vote) {
                  return {
                    ...post,
                    up_votes_count:
                      vote === "up"
                        ? post.up_votes_count - 1
                        : post.up_votes_count,
                    down_votes_count:
                      vote === "down"
                        ? post.down_votes_count - 1
                        : post.down_votes_count,
                    user_voted: null,
                  };
                }
                if (post.user_voted && post.user_voted?.vote !== vote) {
                  return {
                    ...post,
                    up_votes_count:
                      vote === "up"
                        ? post.up_votes_count + 1
                        : post.up_votes_count - 1,
                    down_votes_count:
                      vote === "down"
                        ? post.down_votes_count + 1
                        : post.down_votes_count - 1,
                    user_voted: {
                      id: postId,
                      post_id: postId,
                      vote: vote,
                    },
                  };
                }
                return {
                  ...post,
                  up_votes_count:
                    vote === "up"
                      ? post.up_votes_count + 1
                      : post.up_votes_count,
                  down_votes_count:
                    vote === "down"
                      ? post.down_votes_count + 1
                      : post.down_votes_count,
                  user_voted: {
                    id: postId,
                    post_id: postId,
                    vote: vote,
                  },
                };
              }
              return post;
            }),
          };
        }
      );
    },
    onError: (error) => {
      toast({
        title: "投票失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      return api.discussions.createPost({
        slug: currentDiscussion?.slug,
        content,
        parent_id: replyTo?.id,
        quote: replyTo
          ? {
              username: replyTo.user.username,
              content: replyTo.content,
            }
          : undefined,
      });
    },
    onMutate: () => {
      setIsSubmitting(true);
    },
    onSuccess: () => {
      setCommentContent("");
      setReplyTo(null);
      editorRef.current?.reset?.();
      queryClient.invalidateQueries({
        queryKey: ["discussion-posts", slug, initialDiscussion.board_id],
      });
      toast({
        title: "评论已发布",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error("Failed to post comment:", error);
      toast({
        title: "评论发布失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  React.useEffect(() => {
    setDiscussion(initialDiscussion);
  }, [initialDiscussion, setDiscussion]);

  const handleReplyClick = React.useCallback(
    (comment: Post) => {
      requireAuth(() => {
        setReplyTo(comment);
        document.getElementById("comment")?.scrollIntoView({
          behavior: "smooth",
        });
      });
    },
    [requireAuth]
  );

  const handleVote = React.useCallback(
    debounce((postId: number, vote: "up" | "down") => {
      if (voteMutation.isPending) return;
      requireAuth(() => {
        voteMutation.mutate({ postId, vote });
      });
    }, 500),
    [voteMutation, requireAuth]
  );

  const handleSubmitComment = React.useCallback(
    (content: string) => {
      if (!content.trim() || isSubmitting) return;
      commentMutation.mutate(content);
    },
    [isSubmitting, commentMutation]
  );

  const handleBookmark = React.useCallback(() => {
    requireAuth(() => {
      bookmarkMutation.mutate();
    });
  }, [requireAuth, bookmarkMutation]);

  const handleFollow = React.useCallback(() => {
    requireAuth(() => {
      followMutation.mutate();
    });
  }, [requireAuth, followMutation]);

  if (!currentDiscussion) {
    return null;
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6 mb-4 md:mb-8">
        <div className="flex-1 min-w-0">
          <div className="border-b pb-4 flex-1 max-w-4xl">
            <div className="w-full">
              <h2 className="text-xl md:text-2xl font-medium overflow-hidden text-ellipsis whitespace-nowrap">
                {currentDiscussion.title}
              </h2>
            </div>

            <div className="mt-2 flex items-start space-x-3">
              <Link href={`/u/${currentDiscussion.user.username}`}>
                <Avatar className="h-12 w-12 md:h-14 md:w-14 flex-shrink-0">
                  <AvatarImage
                    src={currentDiscussion.user.avatar_url}
                    alt={currentDiscussion.user.username}
                  />
                  <AvatarFallback>
                    {currentDiscussion.user.username[0]}
                  </AvatarFallback>
                </Avatar>
              </Link>

              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex items-center space-x-2">
                  <Link href={`/u/${currentDiscussion.user.username}`}>
                    <span className="text-base md:text-lg font-medium truncate">
                      {currentDiscussion.user.username}
                    </span>
                  </Link>
                  <span className="flex-shrink-0 mx-2 text-gray-300">·</span>
                  <span className="text-xs md:text-sm text-gray-500 flex-shrink-0">
                    {formatDistanceToNow(
                      new Date(currentDiscussion.created_at),
                      {
                        addSuffix: true,
                        locale: zhCN,
                      }
                    )}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  <span>来自 {currentDiscussion.board.name}</span>
                  <span> # {currentDiscussion.board_child.name}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="py-4 px-2 md:px-4 text-muted-foreground w-full text-base">
            <PostContent post={currentDiscussion.main_post} />
          </div>

          <div className="flex items-center justify-between border-b">
            <div className="flex items-center pb-2">
              <span>评论</span>
              <span className="w-2"></span>
              <span className="text-blue-600">
                {currentDiscussion.comment_count - 1}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <CommentList
              comments={comments.items}
              isLoading={isLoading}
              onReply={handleReplyClick}
              onVote={handleVote}
            />

            {user && commentContent && (
              <div className="mt-6 pt-2 pb-4 border-b">
                <div className="flex items-start space-x-3 px-2 md:px-4 min-w-0">
                  <Avatar className="h-8 w-8 md:h-12 md:w-12 flex-shrink-0">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>
                      {user.nickname?.[0] || user.username?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex items-center">
                      <span className="font-medium text-sm md:text-base truncate">
                        {user.nickname || user.username}
                      </span>
                    </div>
                    <div className="mt-1 text-gray-900 text-base break-words">
                      <Preview content={commentContent} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <CommentEditor
              user={user || null}
              content={commentContent}
              onChange={setCommentContent}
              onSubmit={handleSubmitComment}
              isSubmitting={isSubmitting}
              replyTo={replyTo}
              onCancelReply={() => setReplyTo(null)}
              editorRef={editorRef}
              openLoginModal={openLoginModal}
            />
          </div>
        </div>

        <aside className="hidden lg:block sticky top-4 w-full lg:w-40 xl:w-60 flex-shrink-0 pl-2">
          <div className="flex w-full flex-col space-y-3">
            <Button
              variant={isFollowed ? "default" : "secondary"}
              className="w-full justify-between"
              onClick={handleFollow}
              disabled={followMutation.isPending}
            >
              <div className="flex items-center">
                <Star
                  className={`mr-2 h-4 w-4 ${isFollowed ? "fill-current" : ""}`}
                />
                {followMutation.isPending
                  ? "处理中..."
                  : isFollowed
                  ? "已关注"
                  : "关注"}
              </div>
            </Button>

            <Button
              variant={isBookmarked ? "default" : "secondary"}
              className="w-full justify-between"
              onClick={handleBookmark}
              disabled={bookmarkMutation.isPending}
            >
              <div className="flex items-center">
                <Bookmark
                  className={`mr-2 h-4 w-4 ${
                    isBookmarked ? "fill-current" : ""
                  }`}
                />
                {isBookmarked ? "已添加书签" : "书签"}
              </div>
            </Button>
          </div>
        </aside>
      </div>
    </ErrorBoundary>
  );
}
