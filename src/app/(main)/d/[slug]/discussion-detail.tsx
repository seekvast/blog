"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useDiscussionStore } from "@/store/discussion";
import { useAuth } from "@/components/providers/auth-provider";
import { formatDate, fromNow } from "@/lib/dayjs";
import type { Discussion, Pagination } from "@/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  X,
  ChevronDown,
  Star,
  Bookmark,
  Check,
  EyeOff,
  ThumbsUp,
  ThumbsDown,
  UserRound,
} from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { PostNavigator } from "@/components/post/post-navigator";
import { useLoginModal } from "@/components/providers/login-modal-provider";
import { PostContent } from "@/components/post/post-content";
import { api } from "@/lib/api";
import { Preview } from "@/components/editor/Preview";
import { toast } from "@/components/ui/use-toast";
import { VotersList } from "@/components/post/voters-list";
import { useState } from "react";
import {
  useMutation,
  useQueryClient,
  useInfiniteQuery,
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
  const [postForm, setPostForm] = React.useState(initPostForm);

  const { user } = useAuth();
  const { requireAuth } = useRequireAuth();
  const { openLoginModal } = useLoginModal();
  const { currentDiscussion, setDiscussion } = useDiscussionStore();

  const [replyTo, setReplyTo] = React.useState<Post | null>(null);
  const [editingPost, setEditingPost] = React.useState<Post | null>(null);
  const editorRef = React.useRef<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(
    initialDiscussion?.discussion_user?.is_bookmarked === "yes"
  );
  const [followStatus, setFollowStatus] = useState<string | null>(
    initialDiscussion?.discussion_user?.subscription || null
  );
  const [showCommentEditor, setShowCommentEditor] = useState(false);
  const queryClient = useQueryClient();
  const [queryParams, setQueryParams] = React.useState<{
    page: number;
    per_page: number;
  }>({
    page: 1,
    per_page: 10,
  });
  const [totalPosts, setTotalPosts] = React.useState(
    initialDiscussion?.comment_count > 0 ? initialDiscussion.comment_count : 1
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
    queryKey: [
      "discussion-posts",
      slug,
      initialDiscussion?.board_id,
      queryParams,
    ],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        return await api.discussions.posts({
          slug,
          board_id: initialDiscussion.board_id,
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
    enabled: !!currentDiscussion,
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

  const followMutation = useMutation({
    mutationFn: (action: string | null) =>
      api.discussions.saveFollow({
        slug: currentDiscussion?.slug,
        action,
      }),
    onMutate: (action) => {
      setFollowStatus(action);
    },
    onError: (error, action, context) => {
      // 恢复之前的状态
      setFollowStatus(initialDiscussion?.discussion_user?.subscription || null);
      toast({
        title: "操作失败",
        description: "关注操作失败，请稍后重试",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title:
          followStatus === "follow"
            ? "已关注"
            : followStatus === "ignore"
            ? "已忽视"
            : "已取消关注",
        description:
          followStatus === "follow"
            ? "将接收此讨论的更新"
            : followStatus === "ignore"
            ? "将不再接收此讨论的更新"
            : "已取消关注此讨论",
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
      console.error("Failed to post comment:", error);
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
        queryKey: [
          "discussion-posts",
          slug,
          initialDiscussion.board_id,
          queryParams,
        ],
      });
      toast({
        title: "发布成功",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error("Failed to post comment:", error);
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
        queryKey: [
          "discussion-posts",
          slug,
          initialDiscussion.board_id,
          queryParams,
        ],
      });
      toast({
        title: "评论已更新",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error("Failed to edit comment:", error);
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
    [isSubmitting, commentMutation, postForm.content]
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
      requireAuth(() => {
        setReplyTo(comment);
        setPostForm((prev) => ({
          ...prev,
          parent_id: comment ? comment.id : 0,
        }));
        setShowCommentEditor(true);
      });
    },
    [requireAuth, setShowCommentEditor]
  );

  const handleEditClick = React.useCallback(
    (comment: Post) => {
      requireAuth(() => {
        setEditingPost(comment);
        setPostForm((prev) => ({
          ...prev,
          content: comment.raw_content,
          parent_id: comment.parent_id,
        }));
        setShowCommentEditor(true);
      });
    },
    [requireAuth, setShowCommentEditor]
  );

  const handleVote = React.useCallback(
    debounce(
      (postId: number, vote: "up" | "down", isMainPost: boolean = false) => {
        if (voteMutation.isPending) return;
        requireAuth(() => {
          voteMutation.mutate({ postId, vote, isMainPost });
        });
      },
      500
    ),
    [voteMutation, requireAuth]
  );

  const handleBookmark = React.useCallback(() => {
    requireAuth(() => {
      bookmarkMutation.mutate();
    });
  }, [requireAuth, bookmarkMutation]);

  const handleFollow = React.useCallback(
    (action: string | null = null) => {
      requireAuth(() => {
        followMutation.mutate(action);
      });
    },
    [requireAuth, followMutation]
  );

  React.useEffect(() => {
    setDiscussion(initialDiscussion);
  }, [initialDiscussion, setDiscussion]);

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

  if (!currentDiscussion) {
    return null;
  }

  return (
    <ErrorBoundary>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto] gap-4 md:gap-6 mb-4 md:mb-8">
        <div className="min-w-0">
          <div className="border-b pb-4 flex-1 max-w-4xl">
            <div className="w-full">
              <h2 className="text-xl md:text-2xl font-medium overflow-hidden text-ellipsis whitespace-nowrap">
                {currentDiscussion.title}
              </h2>
            </div>

            <div className="mt-2 flex items-start space-x-3">
              <Link
                href={`/u/${currentDiscussion.user.username}?hashid=${currentDiscussion.user.hashid}`}
              >
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
                <div className="flex items-center space-x-2 text-xs md:text-sm text-muted-foreground">
                  <Link
                    href={`/u/${currentDiscussion.user.username}?hashid=${currentDiscussion.user.hashid}`}
                  >
                    <span className="text-base md:text-lg font-medium truncate">
                      {currentDiscussion.user.username}
                    </span>
                  </Link>
                  <span className="flex-shrink-0 mx-2 text-gray-300">·</span>
                  <span className=" flex-shrink-0">
                    {fromNow(currentDiscussion.created_at)}
                  </span>
                  {currentDiscussion.main_post.editor && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <div>
                          <span className="flex-shrink-0 mx-2 text-gray-300">
                            ·
                          </span>
                          <button className="hover:text-primary">已编辑</button>
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
                            {currentDiscussion.main_post.editor.nickname ||
                              currentDiscussion.main_post.editor.username}{" "}
                            编辑于{" "}
                            {currentDiscussion.main_post.edited_at
                              ? formatDate(
                                  currentDiscussion.main_post.edited_at,
                                  "YYYY年M月D日"
                                )
                              : "未知"}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  <span>来自 {currentDiscussion.board.name}</span>
                  <span> # {currentDiscussion.board_child.name}</span>
                </div>
              </div>
              <DiscussionActions discussion={currentDiscussion} />
            </div>
          </div>

          <div className="py-4 px-2 md:px-4 text-muted-foreground w-full text-base">
            <PostContent post={currentDiscussion.main_post} />
            {currentDiscussion.poll && (
              <PollContent
                poll={currentDiscussion.poll}
                onVote={async (optionIds) => {
                  try {
                    const response = await api.discussions.votePoll({
                      slug: currentDiscussion.slug,
                      poll_id: currentDiscussion.poll?.id,
                      options: optionIds,
                    });
                    queryClient.invalidateQueries({
                      queryKey: ["discussion", slug],
                    });
                    toast({
                      title: "投票成功",
                      variant: "default",
                    });
                    return response;
                  } catch (error) {
                    toast({
                      title: "投票失败",
                      description: "请稍后重试",
                      variant: "destructive",
                    });
                    return null;
                  }
                }}
              />
            )}
          </div>
          <div className="flex justify-between items-center mb-4 px-2 text-muted-foreground text-sm">
            <div className="flex items-center space-x-4 md:space-x-8 cursor-pointer">
              <div className="flex items-center space-x-2">
                <ThumbsUp
                  className={cn(
                    "h-4 w-4",
                    currentDiscussion.main_post.user_voted?.vote === "up" &&
                      "text-primary fill-primary"
                  )}
                  onClick={() =>
                    handleVote(currentDiscussion.main_post.id, "up", true)
                  }
                />
                {currentDiscussion.main_post.up_votes_count > 0 && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="text-xs md:text-sm hover:text-primary">
                        {currentDiscussion.main_post.up_votes_count}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="start">
                      <VotersList postId={currentDiscussion.main_post.id} />
                    </PopoverContent>
                  </Popover>
                )}
              </div>
              <button
                onClick={() =>
                  handleVote(currentDiscussion.main_post.id, "down", true)
                }
              >
                <ThumbsDown
                  className={cn(
                    "h-4 w-4",
                    currentDiscussion.main_post.user_voted?.vote === "down" &&
                      "text-destructive fill-destructive"
                  )}
                />
                {currentDiscussion.main_post.down_votes_count > 5 && (
                  <span className="text-xs md:text-sm">
                    {currentDiscussion.main_post.down_votes_count}
                  </span>
                )}
              </button>
            </div>
            <AuthGuard>
              <CommentButton
                discussion={currentDiscussion}
                isLocked={currentDiscussion?.is_locked === 1}
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
              <span className="pl-1 text-primary">{totalPosts}</span>
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
                  discussion={currentDiscussion}
                  comments={allComments}
                  isLoading={isLoading}
                  onReply={handleReplyClick}
                  onEdit={handleEditClick}
                  onVote={handleVote}
                  onSubmitReply={handleSubmitComment}
                  onEditComment={handleEditComment}
                  isLocked={currentDiscussion?.is_locked === 1}
                />
              </InfiniteScroll>
              {!currentDiscussion?.is_locked && (
                <div className="flex items-start space-x-3 px-2 md:px-4 mt-4">
                  <Avatar className="h-10 w-10 md:h-10 md:w-10 flex-shrink-0">
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
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium">
                        {editingPost ? "编辑回复" : "发表回复"}
                      </h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
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
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {user &&
                      postForm.content &&
                      postForm.content.trim().length > 0 && (
                        <div className="mb-6 pt-2 pb-4 border-b">
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
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className="hidden lg:block sticky top-20 w-full lg:w-40 xl:w-60 self-start pl-2">
          {user ? (
            <div className="flex w-full flex-col space-y-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={followStatus ? "default" : "secondary"}
                    className="w-full justify-between"
                    onClick={() =>
                      handleFollow(followStatus === "follow" ? null : "follow")
                    }
                    disabled={followMutation.isPending}
                  >
                    <div className="flex items-center">
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
                    </div>
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
              <AuthGuard>
                <CommentButton
                  discussion={currentDiscussion}
                  isLocked={currentDiscussion?.is_locked === 1}
                  isSubmitting={isSubmitting}
                  showEditor={showCommentEditor}
                  onClick={() => {
                    if (!user) {
                      openLoginModal();
                      return;
                    }
                    setShowCommentEditor(true);
                  }}
                  className="w-full justify-between"
                  size="lg"
                />
              </AuthGuard>
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
