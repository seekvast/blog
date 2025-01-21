"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useDiscussionStore } from "@/store/discussion";
import { useAuthStore } from "@/store/auth";
import { DetailMarkdownRenderer } from "@/components/markdown/detail-markdown-renderer";
import { DiscussionSidebar } from "@/components/discussion/discussion-sidebar";
import { PostEditor } from "@/components/post/post-editor";
import { UserLink } from "@/components/markdown/user-link";
import { useLoginModal } from "@/components/providers/login-modal-provider";
import { AsyncBoundary } from "@/components/ui/async-boundary";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Link } from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Icon } from "@/components/icons";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface User {
  hashid: string;
  username: string;
  nickname: string;
  avatar_url: string;
}

interface Attachment {
  id: number;
  attachable_id: number;
  file_size: number;
  file_name: string;
  file_path: string;
  file_type: string;
}

interface Comment {
  id: number;
  user: User;
  attachments: Attachment[];
  content: string;
  created_at: string;
  number: number;
  likes: number;
  replies: number;
  quote?: {
    username: string;
    content: string;
  };
  parent_post?: {
    user: User;
  };
}

interface CommentResponse {
  items: Comment[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

interface MainPost {
  id: number;
  board_id: number;
  board_child_id: number;
  number: number;
  parent_id: number;
  depth: number;
  is_private: number;
  is_approved: number;
  user_hashid: string;
  edited_user_hashid: string;
  board_creator_hashid: string;
  type: string;
  content: string;
  edited_at: string | null;
  hidden_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  attachments: Array<{
    id: number;
    attachable_id: number;
    file_size: number;
    file_name: string;
    file_path: string;
    file_type: string;
    mime_type: string;
  }>;
}

interface Board {
  id: number;
  name: string;
  is_joined?: number;
}

interface BoardChild {
  id: number;
  name: string;
}

interface Discussion {
  title: string;
  comment_count: number;
  participant_count: number;
  post_number_index: number;
  user_hashid: string;
  first_post_id: number;
  last_posted_at: string | null;
  last_posted_user_hashid: string;
  last_post_id: number;
  last_post_number: number;
  board_id: number;
  board_child_id: number;
  board_creator_hashid: string;
  hidden_at: string | null;
  hidden_user_hashid: string;
  slug: string;
  is_private: number;
  is_approved: number;
  is_locked: number;
  is_sticky: number;
  view_count: number;
  votes: number;
  hotness: number;
  created_at: string;
  updated_at: string;
  main_post: MainPost;
  board: Board;
  board_child: BoardChild;
  user: User;
}

export default function DiscussionDetailPage() {
  const params = useParams();
  const { currentDiscussion, loading, error, fetchDiscussion } = useDiscussionStore();
  const user = useAuthStore((state) => state.user);
  const { openLoginModal } = useLoginModal();
  const [commentContent, setCommentContent] = React.useState("");
  const [replyTo, setReplyTo] = React.useState<Comment | null>(null);
  const [pendingReplyTo, setPendingReplyTo] = React.useState<Comment | null>(null);

  React.useEffect(() => {
    if (params.slug) {
      fetchDiscussion(params.slug as string);
    }
  }, [params.slug, fetchDiscussion]);

  const handleReply = () => {
    if (!user) {
      openLoginModal();
      return;
    }
    // 打开回复编辑器
  };

  const handleSubmitComment = async (content: string) => {
    if (!content.trim()) {
      return;
    }

    try {
      const response = await fetch("/api/discussion/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug: currentDiscussion?.slug,
          content: content.trim(),
          parent_id: replyTo?.id,
          quote: replyTo
            ? {
                username: replyTo.user.username,
                content: replyTo.content,
              }
            : undefined,
        }),
      });

      if (response.ok) {
        setCommentContent("");
        setReplyTo(null);
        // 刷新评论列表
        const commentsRes = await fetch(`/api/discussion/posts?slug=${encodeURIComponent(params.slug as string)}`);
        if (commentsRes.ok) {
          const commentsData = await commentsRes.json();
          // 更新评论列表
        }
      }
    } catch (error) {
      console.error("Failed to post comment:", error);
    }
  };

  if (!currentDiscussion) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AsyncBoundary loading={loading} error={error}>
        <div className="flex gap-8">
          <div className="flex-1">
            <article className="prose prose-sm max-w-none">
              <header className="mb-8">
                <h1 className="text-3xl font-bold">{currentDiscussion.title}</h1>
                <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                  <UserLink user={currentDiscussion.user} />
                  <time>
                    {formatDistanceToNow(new Date(currentDiscussion.created_at), {
                      addSuffix: true,
                      locale: zhCN,
                    })}
                  </time>
                </div>
              </header>

              <DetailMarkdownRenderer content={currentDiscussion.main_post.content} />

              <div className="mt-8">
                <Button onClick={handleReply}>回复</Button>
              </div>

              {/* 评论列表 */}
              <div className="mt-8">
                {/* 使用评论组件 */}
                {currentDiscussion.comment_count > 0 ? (
                  <div className="space-y-4">
                    {/* 评论列表 */}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8 text-muted-foreground">
                    暂无评论
                  </div>
                )}
              </div>

              {/* 评论编辑器 */}
              {!user ? (
                <div className="mt-6 w-full flex justify-center p-8">
                  <span>请</span>
                  <span className="text-primary cursor-pointer" onClick={() => openLoginModal()}>
                    登录
                  </span>
                  <span>后发表评论</span>
                </div>
              ) : (
                <div className="mt-6">
                  <PostEditor
                    content={commentContent}
                    onChange={setCommentContent}
                    className="rounded-lg border border-gray-200 bg-background"
                    replyTo={replyTo}
                    onReplyToChange={(comment) => setReplyTo(comment ?? null)}
                    onSubmit={handleSubmitComment}
                    onImageUpload={async (file) => {
                      const formData = new FormData();
                      formData.append("image", file);
                      formData.append("attachment_type", "comment_images");

                      try {
                        const response = await fetch("/api/upload/image", {
                          method: "POST",
                          body: formData,
                        });
                      } catch (error) {
                        console.error("Failed to upload image:", error);
                      }
                    }}
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <div></div>
                    <Button size="sm" onClick={() => handleSubmitComment(commentContent)}>
                      发布评论
                    </Button>
                  </div>
                </div>
              )}
            </article>
          </div>

          <DiscussionSidebar discussion={currentDiscussion} />
        </div>
      </AsyncBoundary>
    </div>
  );
}
