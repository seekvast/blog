"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useDiscussionStore } from "@/store/discussion";
import { useAuth } from "@/components/providers/auth-provider";
import { formatDate, fromNow } from "@/lib/dayjs";
import type { Discussion, Pagination } from "@/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { UserRoleBadge } from "@/components/board/user-role-badge";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUp,
  Bookmark,
  BookmarkCheck,
  Check,
  ChevronDown,
  EyeOff,
  Heart,
  Lock,
  MessageSquare,
  Pin,
  Star,
  Tag,
  ThumbsDown,
  ThumbsUp,
  UserRound,
  X,
} from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { PostNavigator } from "@/components/post/post-navigator";
import { useLoginModal } from "@/components/providers/login-modal-provider";
import { PostContent } from "@/components/post/post-content";
import { api } from "@/lib/api";
import { Preview } from "@/components/editor/preview";
import { toast } from "@/components/ui/use-toast";
import { VotersList } from "@/components/post/voters-list";
import { useState } from "react";
import {
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  useQuery,
  QueryClient,
} from "@tanstack/react-query";
import { cn, debounce } from "@/lib/utils";
import type { Post } from "@/types/discussion";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { Button } from "@/components/ui/button";
import { CommentList } from "@/components/post/comment-list";
import { CommentEditor } from "@/components/post/comment-editor";
import { ErrorBoundary } from "@/components/error/error-boundary";
import Link from "next/link";
import { PollContent } from "@/components/post/poll-content";
import { PostForm } from "@/validations/post";
import { Attachment } from "@/types";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CommentButton } from "@/components/post/comment-button";
import { DiscussionActions } from "@/components/post/discussion-actions";
import { useCompactNumberFormat } from "@/lib/utils/format";
import { useNsfwWarning } from "@/hooks/use-nsfw-warning";
import { NsfwWarningModal } from "@/components/nsfw/nsfw-warning-modal";

interface DiscussionDetailProps {
  initialDiscussion: Discussion;
}

// 表单初始值
const initPostForm: PostForm = {
  slug: "",
  content: "",
  attachments: [] as {
    id: number;
    file_name: string;
    file_type: string;
    file_path: string;
  }[],
};

export function DiscussionDetail({ initialDiscussion }: DiscussionDetailProps) {
  const params = useParams();
  const slug = params?.slug as string;
  if (!slug) {
    return <div>Invalid discussion URL</div>;
  }

  const formatCompactNumber = useCompactNumberFormat();

  const [postForm, setPostForm] = React.useState(initPostForm);

  const { user } = useAuth();
  const { requireAuth, requireAuthAndEmailVerification } = useRequireAuth();
  const { openLoginModal } = useLoginModal();
  const { currentDiscussion, setDiscussion } = useDiscussionStore();

  const { data: discussionData, isLoading: discussionLoading } = useQuery({
    queryKey: ["discussion", slug],
    queryFn: () => api.discussions.get(slug),
    initialData: initialDiscussion,
    staleTime: 1 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const discussion = discussionData || initialDiscussion;

  const [replyTo, setReplyTo] = React.useState<Post | null>(null);
  const [editingPost, setEditingPost] = React.useState<Post | null>(null);
  const editorRef = React.useRef<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(
    discussion?.discussion_user?.is_bookmarked === "yes"
  );
  const [followStatus, setFollowStatus] = useState<string | null>(
    discussion?.discussion_user?.subscription || null
  );
  const [showCommentEditor, setShowCommentEditor] = useState(false);

  // NSFW 提醒功能
  const {
    showWarning: showNsfwWarning,
    handleConfirm: handleNsfwConfirm,
    handleCancel: handleNsfwCancel,
  } = useNsfwWarning(undefined, discussion);

  const queryClient = useQueryClient();
  const [queryParams, setQueryParams] = React.useState<{
    page: number;
    per_page: number;
  }>({
    page: 1,
    per_page: 10,
  });
  const [totalPosts, setTotalPosts] = React.useState(
    discussion?.comment_count > 0 ? discussion.comment_count : 1
  );
  const {
    data: comments = {
      pages: [],
      pageParams: [],
    },
    isLoading,
    error: commentsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["discussion-posts", slug],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        return await api.discussions.posts({
          slug,
          board_id: discussion.board_id,
          page: pageParam,
          per_page: queryParams.per_page,
        });
      } catch (error) {
        console.error("Failed to fetch comments:", error);
        throw error;
      }
    },
    initialPageParam: queryParams.page,
    getNextPageParam: (lastPage) => {
      if (lastPage.current_page < lastPage.last_page) {
        return lastPage.current_page + 1;
      }
      return undefined;
    },
    enabled: !!discussion,
    staleTime: 10 * 1000,
  });

  React.useEffect(() => {
    if (comments.pages && comments.pages.length > 0) {
      setTotalPosts(comments.pages[0].total);
    }
  }, [comments.pages]);

  const loadLastPage = React.useCallback(async () => {
    if (comments.pages && comments.pages.length > 0) {
      const total = comments.pages[0].total || 0;
      const loadedItems = comments.pages.flatMap((page) => page.items).length;

      if (loadedItems >= total) {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: "smooth",
        });
        return;
      }

      try {
        setQueryParams({
          page: 1,
          per_page: total,
        });

        setTimeout(() => {
          window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: "smooth",
          });
        }, 1000);
        return;
      } catch (error) {
        console.error("加载所有回复失败:", error);
      }
    }
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  }, [comments.pages]);

  const allComments = React.useMemo(() => {
    return comments.pages?.flatMap((page) => page.items) || [];
  }, [comments.pages]);

  const bookmarkMutation = useMutation({
    mutationFn: () =>
      api.discussions.saveBookmark({
        slug: discussion?.slug,
        is_bookmarked: isBookmarked ? "no" : "yes",
      }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["discussion", slug] });

      const previousDiscussion = queryClient.getQueryData(["discussion", slug]);

      queryClient.setQueryData(["discussion", slug], (old: Discussion) => {
        if (!old) return old;
        return {
          ...old,
          discussion_user: {
            ...old.discussion_user,
            is_bookmarked: isBookmarked ? "no" : "yes",
          },
        };
      });

      setIsBookmarked((prev) => !prev);
      return { previousDiscussion };
    },
    onError: (error, variables, context) => {
      if (context?.previousDiscussion) {
        queryClient.setQueryData(
          ["discussion", slug],
          context.previousDiscussion
        );
      }
      setIsBookmarked((prev) => !prev);
      toast({
        title: "操作失败",
        description: "书签操作失败，请稍后重试",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["discussions"],
      });
      queryClient.invalidateQueries({
        queryKey: ["userDiscussions"],
      });
    },
  });

  const followMutation = useMutation({
    mutationFn: (action: string | null) =>
      api.discussions.saveFollow({
        slug: discussion?.slug,
        action,
      }),
    onMutate: async (action) => {
      await queryClient.cancelQueries({ queryKey: ["discussion", slug] });
      const previousDiscussion = queryClient.getQueryData(["discussion", slug]);
      queryClient.setQueryData(["discussion", slug], (old: Discussion) => {
        if (!old) return old;
        return {
          ...old,
          discussion_user: {
            ...old.discussion_user,
            subscription: action || "",
          },
        };
      });

      setFollowStatus(action);
      return { previousDiscussion };
    },
    onError: (error, action, context) => {
      if (context?.previousDiscussion) {
        queryClient.setQueryData(
          ["discussion", slug],
          context.previousDiscussion
        );
      }
      setFollowStatus(discussion?.discussion_user?.subscription || null);
      toast({
        title: "操作失败",
        description: "关注操作失败，请稍后重试",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["discussions"],
      });
      queryClient.invalidateQueries({
        queryKey: ["userDiscussions"],
      });
    },
  });

  // 更新帖子投票数据的辅助函数
  const updatePostVoteData = (
    queryClient: QueryClient,
    postId: number,
    vote: "up" | "down"
  ) => {
    queryClient.setQueryData(
      ["discussion-posts", slug, initialDiscussion.board_id, queryParams],
      (oldData: any) => {
        if (!oldData) return oldData;

        const newPages = oldData.pages.map((page) => {
          const updatePostVote = (posts: Post[]): Post[] => {
            return posts.map((post) => {
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
                } else if (post.user_voted) {
                  return {
                    ...post,
                    up_votes_count:
                      vote === "up"
                        ? post.up_votes_count + 1
                        : post.up_votes_count -
                          (post.user_voted.vote === "up" ? 1 : 0),
                    down_votes_count:
                      vote === "down"
                        ? post.down_votes_count + 1
                        : post.down_votes_count -
                          (post.user_voted.vote === "down" ? 1 : 0),
                    user_voted: {
                      id: postId,
                      post_id: postId,
                      vote,
                    },
                  };
                } else {
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
                      vote,
                    },
                  };
                }
              }

              if (post.children && post.children.length > 0) {
                return {
                  ...post,
                  children: updatePostVote(post.children),
                };
              }

              return post;
            });
          };

          return {
            ...page,
            items: updatePostVote(page.items),
          };
        });

        return {
          ...oldData,
          pages: newPages,
        };
      }
    );
  };

  const voteMutation = useMutation({
    mutationFn: ({
      postId,
      vote,
      isMainPost,
    }: {
      postId: number;
      vote: "up" | "down";
      isMainPost: boolean;
    }) =>
      api.posts.vote({
        id: postId,
        vote,
      }),
    onSuccess: (_, { postId, vote, isMainPost }) => {
      if (isMainPost) {
        api.discussions
          .get(slug)
          .then((data) => {
            setDiscussion(data);
          })
          .catch((error) => {
            console.error("Failed to refresh discussion data:", error);
          });
      } else {
        updatePostVoteData(queryClient, postId, vote);
      }
    },
    onError: (error) => {
      toast({
        title: "失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (postForm: PostForm) => {
      return api.discussions.createPost({
        slug: currentDiscussion?.slug,
        content: postForm.content,
        parent_id: postForm.parent_id,
        attachments: postForm.attachments,
      });
    },
    onMutate: () => {
      setIsSubmitting(true);
    },
    onSuccess: () => {
      setPostForm(initPostForm);
      setReplyTo(null);
      editorRef.current?.reset?.();
      queryClient.invalidateQueries({
        queryKey: ["discussion-posts", slug],
      });
      queryClient.invalidateQueries({
        queryKey: ["discussion", slug],
      });
    },
    onError: (error) => {
      toast({
        title: "发布失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const editCommentMutation = useMutation({
    mutationFn: async (data: { id: number; content: string }) => {
      return api.posts.update({
        id: data.id,
        content: data.content,
      });
    },
    onMutate: () => {
      setIsSubmitting(true);
    },
    onSuccess: () => {
      setPostForm(initPostForm);
      setEditingPost(null);
      editorRef.current?.reset?.();
      queryClient.invalidateQueries({
        queryKey: ["discussion-posts", slug],
      });
      queryClient.invalidateQueries({
        queryKey: ["discussion", slug],
      });
    },
    onError: (error) => {
      toast({
        title: "评论更新失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const handleSubmitComment = React.useCallback(
    (postForm: PostForm) => {
      if (currentDiscussion?.is_locked === 1) {
        return;
      }

      if (!postForm.content.trim() || isSubmitting) return;

      commentMutation.mutate(postForm);
      setReplyTo(null);
    },
    [isSubmitting, commentMutation, currentDiscussion?.is_locked]
  );

  const handleEditComment = React.useCallback(
    (data: { id: number; content: string }) => {
      if (currentDiscussion?.is_locked === 1) {
        return;
      }

      if (!data.content.trim() || isSubmitting) return;

      editCommentMutation.mutate(data);
    },
    [isSubmitting, editCommentMutation]
  );

  const handleReplyClick = React.useCallback(
    (comment: Post) => {
      requireAuthAndEmailVerification(() => {
        setReplyTo(comment);
        setPostForm((prev) => ({
          ...prev,
          parent_id: comment ? comment.id : 0,
        }));
        setShowCommentEditor(true);
      });
    },
    [requireAuthAndEmailVerification, setShowCommentEditor]
  );

  const handleEditClick = React.useCallback(
    (comment: Post) => {
      requireAuthAndEmailVerification(() => {
        setEditingPost(comment);
        setPostForm((prev) => ({
          ...prev,
          content: comment.raw_content,
          parent_id: comment.parent_id,
        }));
        setShowCommentEditor(true);
      });
    },
    [requireAuthAndEmailVerification, setShowCommentEditor]
  );

  const handleVote = React.useCallback(
    debounce(
      (postId: number, vote: "up" | "down", isMainPost: boolean = false) => {
        if (voteMutation.isPending) return;
        requireAuthAndEmailVerification(() => {
          voteMutation.mutate({ postId, vote, isMainPost });
        });
      },
      500
    ),
    [voteMutation, requireAuthAndEmailVerification]
  );

  const handleBookmark = React.useCallback(() => {
    requireAuthAndEmailVerification(() => {
      bookmarkMutation.mutate();
    });
  }, [requireAuthAndEmailVerification, bookmarkMutation]);

  const handleFollow = React.useCallback(
    (action: string | null = null) => {
      requireAuthAndEmailVerification(() => {
        followMutation.mutate(action);
      });
    },
    [requireAuthAndEmailVerification, followMutation]
  );

  React.useEffect(() => {
    setDiscussion(discussion);
  }, [discussion, setDiscussion]);

  const handleAttachmentUpload = (attachment: Attachment) => {
    const formattedAttachment = {
      id: attachment.id,
      file_name: attachment.file_name,
      file_type: attachment.mime_type,
      file_path: attachment.file_path,
    };
    setPostForm((prev) => ({
      ...prev,
      attachments: [...(prev.attachments || []), formattedAttachment],
    }));
  };

  if (!discussion) {
    return null;
  }

  // 类型保护：确保 discussion 不为 null
  const safeDiscussion = discussion as Discussion;

  return (
    <ErrorBoundary>
      {/* NSFW 提醒弹窗 */}
      <NsfwWarningModal
        open={showNsfwWarning}
        onOpenChange={() => {}}
        onConfirm={handleNsfwConfirm}
        onCancel={handleNsfwCancel}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto] gap-4 md:gap-6 mb-4 md:mb-8">
        <div className="min-w-0">
          <div className="border-b pb-4 flex-1 max-w-4xl">
            <div className="w-full">
              <h2 className="text-xl md:text-2xl font-bold overflow-hidden text-ellipsis whitespace-nowrap">
                {safeDiscussion.title}
              </h2>
            </div>

            <div className="mt-2 flex items-center space-x-3">
              <Link
                href={`/u/${discussion.user.username}?hashid=${discussion.user.hashid}`}
              >
                <Avatar className="h-12 w-12 md:h-14 md:w-14 flex-shrink-0">
                  <AvatarImage
                    src={discussion.user.avatar_url}
                    alt={discussion.user.nickname}
                  />
                  <AvatarFallback>
                    {discussion.user.nickname[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>

              <div className="flex-1 min-w-0 overflow-hidden space-y-1">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <Link
                      href={`/u/${discussion.user.username}?hashid=${discussion.user.hashid}`}
                    >
                      <span className="text-base md:text-lg font-medium truncate">
                        {discussion.user.nickname}
                      </span>
                    </Link>
                    <div className="flex items-center space-x-2 min-w-0 text-muted-foreground">
                      <span>@{discussion.user.nickname}</span>
                      <UserRoleBadge
                        boardUser={discussion.board_user}
                        board={discussion.board}
                      />
                    </div>
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
                    <DiscussionActions discussion={discussion} />
                  </div>
                </div>

                <div className="flex items-center space-x-2 lg:space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
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
                    {discussion.main_post.editor && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <div>
                            <span className="flex-shrink-0 mx-2 text-gray-300">
                              ·
                            </span>
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
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <span>
                      来自{" "}
                      <Link
                        href={`/b/${discussion.board.slug}`}
                        className="inline-block max-w-[8ch] lg:max-w-[20ch] truncate align-bottom hover:text-primary"
                      >
                        {discussion.board.name}
                      </Link>
                    </span>
                    <Link
                      href={`/b/${discussion.board.slug}?child=${discussion.board_child.id}`}
                      className="inline-flex items-center hover:text-primary"
                    >
                      <Tag className="h-4 w-4 text-sm mr-1" />
                      <span>{discussion.board_child.name}</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="py-4 px-2 md:px-4 text-muted-foreground w-full text-base">
            <PostContent post={discussion.main_post} />
            {discussion.poll && <PollContent discussion={discussion} />}
          </div>
          <div className="flex justify-between items-center mb-4 px-2 text-muted-foreground text-sm">
            <div className="flex items-center space-x-4 md:space-x-8 cursor-pointer">
              <div className="flex items-center space-x-2">
                <ThumbsUp
                  className={cn(
                    "h-4 w-4",
                    discussion.main_post.user_voted?.vote === "up" &&
                      "text-primary fill-primary"
                  )}
                  onClick={() =>
                    handleVote(discussion.main_post.id, "up", true)
                  }
                />
                {discussion.main_post.up_votes_count > 0 && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="text-xs md:text-sm hover:text-primary">
                        {formatCompactNumber(
                          discussion.main_post.up_votes_count
                        )}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="start">
                      <VotersList postId={discussion.main_post.id} />
                    </PopoverContent>
                  </Popover>
                )}
              </div>
              <button
                onClick={() =>
                  handleVote(discussion.main_post.id, "down", true)
                }
                className="flex items-center space-x-2"
              >
                <ThumbsDown
                  className={cn(
                    "h-4 w-4",
                    discussion.main_post.user_voted?.vote === "down" &&
                      "text-destructive fill-destructive"
                  )}
                />
                {discussion.main_post.down_votes_count > 5 && (
                  <span className="text-xs md:text-sm">
                    {formatCompactNumber(discussion.main_post.down_votes_count)}
                  </span>
                )}
              </button>
            </div>
            <AuthGuard>
              <CommentButton
                discussion={discussion}
                isLocked={discussion?.is_locked === 1}
                isSubmitting={isSubmitting}
                showEditor={showCommentEditor}
                onClick={() => {
                  if (!user) {
                    openLoginModal();
                    return;
                  }
                  setShowCommentEditor(true);
                }}
                variant="text"
                size="sm"
              />
            </AuthGuard>
          </div>
          <div className="flex items-center justify-between px-2 md:px-4 border-b text-sm  text-muted-foreground">
            <div className="flex items-center pb-2 font-bold">
              <span>回复</span>
              <span className="pl-1 text-primary">
                {discussion.comment_count - 1}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <div className={cn(showCommentEditor && "mb-[200px]")}>
              <InfiniteScroll
                hasMore={hasNextPage}
                loading={isFetchingNextPage}
                onLoadMore={fetchNextPage}
              >
                <CommentList
                  discussion={discussion}
                  comments={allComments}
                  isLoading={isLoading}
                  onReply={handleReplyClick}
                  onEdit={handleEditClick}
                  onSubmitReply={handleSubmitComment}
                  onEditComment={handleEditComment}
                  isLocked={discussion?.is_locked === 1}
                  queryKey={["discussion-posts", slug]}
                />
              </InfiniteScroll>
              {!currentDiscussion?.is_locked && (
                <div className="flex items-start space-x-3 px-2 md:px-4 mt-4">
                  <Avatar className="h-8 w-8 md:h-12 md:w-12 flex-shrink-0">
                    <AvatarFallback>
                      <UserRound className="h-4 w-4 md:h-5 md:w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className="flex-1 p-3 border border-border rounded-md bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => {
                      if (!user) {
                        openLoginModal();
                        return;
                      }
                      setShowCommentEditor(true);
                    }}
                  >
                    <div className="text-sm text-muted-foreground">
                      说点什么吧...
                    </div>
                  </div>
                </div>
              )}
            </div>

            {showCommentEditor && (
              <div className="fixed inset-0 flex flex-col justify-end animate-in fade-in duration-300 w-full z-50">
                <div
                  className="bg-background animate-in shadow-[0_-4px_15px_rgba(0,0,0,0.12)] slide-in-from-bottom duration-300"
                  style={{ position: "relative", zIndex: 50 }}
                >
                  <div className="p-4 pb-[calc(1rem+var(--mobile-nav-height))] lg:pb-4 max-w-4xl mx-auto">
                    {user &&
                      postForm.content &&
                      postForm.content.trim().length > 0 && (
                        <div className="mb-6 pt-2 pb-4 border-b">
                          <div className="flex items-start space-x-3 px-2 md:px-4 min-w-0">
                            <Avatar className="h-8 w-8 md:h-12 md:w-12 flex-shrink-0">
                              <AvatarImage src={user.avatar_url} />
                              <AvatarFallback>
                                {user.nickname?.[0].toUpperCase() ||
                                  user.username?.[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0 overflow-hidden">
                              <div className="flex items-center">
                                <span className="font-medium text-sm md:text-base truncate">
                                  {user.nickname || user.username}
                                </span>
                              </div>
                              <div className="mt-1 text-gray-900 text-base break-words">
                                <Preview content={postForm.content} />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    <CommentEditor
                      user={user || null}
                      postForm={postForm}
                      onChange={(newPostForm) => {
                        setPostForm({ ...newPostForm });
                      }}
                      onSubmit={(form) => {
                        if (editingPost) {
                          handleEditComment({
                            id: editingPost.id,
                            content: form.content,
                          });
                        } else {
                          handleSubmitComment(form);
                        }
                        setShowCommentEditor(false);
                      }}
                      isSubmitting={isSubmitting}
                      replyTo={replyTo}
                      onCancelReply={() => setReplyTo(null)}
                      editorRef={editorRef}
                      openLoginModal={openLoginModal}
                      boardId={discussion?.board_id}
                      discussionTitle={discussion.title}
                      onClose={() => {
                        setShowCommentEditor(false);
                        setReplyTo(null);
                        setEditingPost(null);
                        setPostForm({
                          slug: "",
                          parent_id: 0,
                          content: "",
                          attachments: [],
                        });
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className="hidden lg:block sticky top-20 w-full lg:w-[220px] xl:w-[256px] self-start pl-2">
          {user ? (
            <div className="flex w-full flex-col space-y-3">
              {/* Reply Button */}
              {!showCommentEditor && (
                <div className="inline-flex rounded-md shadow-sm w-full">
                  <CommentButton
                    discussion={discussion}
                    isLocked={discussion?.is_locked === 1}
                    isSubmitting={isSubmitting}
                    showEditor={showCommentEditor}
                    isReply={true}
                    onClick={() => {
                      if (!user) {
                        openLoginModal();
                        return;
                      }
                      setShowCommentEditor(true);
                    }}
                    className="rounded-r-none rounded-l-md"
                    size="default"
                    variant="button"
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="default"
                        size="default"
                        className="px-3 rounded-l-none rounded-r-md border-l border-primary-foreground/20"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                  </DropdownMenu>
                </div>
              )}
              {/* Follow Button */}
              <div className="inline-flex rounded-md shadow-sm w-full">
                <Button
                  variant="secondary"
                  className="flex-grow justify-start rounded-r-none rounded-l-md"
                  onClick={() =>
                    handleFollow(followStatus === "follow" ? null : "follow")
                  }
                  disabled={followMutation.isPending}
                >
                  <Star
                    className={`mr-2 h-4 w-4 ${
                      followStatus === "follow" ? "fill-current" : ""
                    }`}
                  />
                  {followMutation.isPending
                    ? "处理中..."
                    : followStatus === "follow"
                    ? "已关注"
                    : followStatus === "ignore"
                    ? "已忽视"
                    : "关注"}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      className="px-3 rounded-l-none rounded-r-md border-l"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem
                      className="flex flex-col items-start cursor-pointer py-2"
                      onClick={() => {
                        if (followStatus) handleFollow(null);
                      }}
                    >
                      <div className="flex w-full items-center">
                        <Star className="mr-2 h-4 w-4" />
                        不关注
                        {!followStatus && <Check className="ml-auto h-4 w-4" />}
                      </div>
                      <span className="text-xs text-muted-foreground mt-1 pl-6">
                        停当有人標註我時通知我。
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex flex-col items-start cursor-pointer py-2"
                      onClick={() => {
                        if (followStatus !== "follow") handleFollow("follow");
                      }}
                    >
                      <div className="flex w-full items-center">
                        <Star className="mr-2 h-4 fill-current" />
                        关注中
                        {followStatus === "follow" && (
                          <Check className="ml-auto h-4 w-4" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground mt-1 pl-6">
                        當有人回覆此文章時通知我。
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex flex-col items-start cursor-pointer py-2"
                      onClick={() => {
                        if (followStatus !== "ignore") handleFollow("ignore");
                      }}
                    >
                      <div className="flex w-full items-center">
                        <EyeOff className="mr-2 h-4 w-4" />
                        忽视中
                        {followStatus === "ignore" && (
                          <Check className="ml-auto h-4 w-4" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground mt-1 pl-6">
                        不接收任何通知並從文章列表中隱藏此文章。
                      </span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Bookmark Button */}
              <div className="inline-flex rounded-md shadow-sm w-full">
                <Button
                  variant="secondary"
                  className="flex-grow justify-start rounded-r-none rounded-l-md"
                  onClick={handleBookmark}
                  disabled={bookmarkMutation.isPending}
                >
                  <Bookmark
                    className={`mr-2 h-4 w-4 ${
                      isBookmarked ? "fill-current" : ""
                    }`}
                  />
                  {isBookmarked ? "已添加书签" : "书签"}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      className="px-3 rounded-l-none rounded-r-md border-l"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>添加到书签</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ) : (
            <Button
              variant={"default"}
              className={cn("w-full")}
              onClick={() => {
                openLoginModal();
              }}
            >
              登入后以回复
            </Button>
          )}

          <PostNavigator
            totalPosts={totalPosts}
            discussionDate={initialDiscussion.created_at}
            hasUnreadPosts={false}
            className="mt-4"
            onScrollToBottom={loadLastPage}
          />
        </aside>
      </div>
    </ErrorBoundary>
  );
}
