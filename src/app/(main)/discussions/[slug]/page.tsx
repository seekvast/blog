"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icons";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { http } from "@/lib/request";
import { DiscussionSidebar } from "@/components/discussion/discussion-sidebar";
import { PostEditor } from "@/components/post/post-editor";
import { API_ROUTES } from "@/constants/api";

interface User {
  hashid: string;
  username: string;
  nickname: string;
  avatar_url: string | null;
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
  user: {
    username: string;
    hashid: string;
  };
  content: string;
  created_at: string;
  number: number;
  likes: number;
  replies: number;
  quote?: {
    username: string;
    content: string;
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
  main_post: MainPost;
  board: Board;
  board_child: BoardChild;
}

export default function DiscussionDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [loading, setLoading] = React.useState(true);
  const [discussion, setDiscussion] = React.useState<Discussion | null>(null);
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [commentContent, setCommentContent] = React.useState("");
  const fetchedRef = React.useRef(false);

  React.useEffect(() => {
    // 在开发环境的严格模式下，useEffect 会被调用两次
    // 使用 ref 来确保只请求一次
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchData = async () => {
      if (!slug) return;

      try {
        // 并行请求讨论和评论数据
        const [discussionRes, commentsRes] = await Promise.all([
          http.get(`/api/discussion?slug=${encodeURIComponent(slug)}`),
          http.get(`/api/discussion/posts?slug=${encodeURIComponent(slug)}`)
        ]);

        if (discussionRes.code === 0) {
          setDiscussion(discussionRes.data);
        } else {
          console.log("Discussion API returned error code:", discussionRes.code);
          setDiscussion(null);
        }

        if (commentsRes.code === 0) {
          setComments(commentsRes.data.items);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setDiscussion(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">Loading...</div>
    );
  }

  if (!discussion) {
    return (
      <div className="flex items-center justify-center p-8">
        Discussion not found
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* 主内容区 */}
      <div className="flex-1">
        {/* 贴文头部信息 */}
        <div className="mb-4">
          <h1 className="text-xl font-medium">{discussion.title}</h1>
          <div className="mt-2 flex items-center space-x-2 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Avatar className="h-5 w-5">
                <AvatarFallback>{discussion.user_hashid[0]}</AvatarFallback>
              </Avatar>
              <span>{discussion.user_hashid}</span>
            </div>
            <span>·</span>
            <span>来自 {discussion.board.name}</span>
            <span className="inline-flex items-center rounded bg-blue-50 px-1.5 py-0.5 text-xs text-blue-600">
              {discussion.board_child.name}
            </span>
          </div>
        </div>

        {/* 贴文内容 */}
        <div className="space-y-4">
          <div className="prose max-w-none text-sm">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            >
              {discussion.main_post.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* 贴文底部操作栏 */}
        <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <Icon name="favorite" className="text-base" />
              <span>{discussion.votes}</span>
            </div>
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <Icon name="chat" className="text-base" />
              <span>{discussion.comment_count}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="h-7">
              <Icon name="share" className="mr-1 h-4 w-4" />
              分享
            </Button>
            <Button variant="ghost" size="sm" className="h-7">
              <Icon name="more" className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 评论区 */}
        <div className="mt-8">
          {/* 评论列表 */}
          {comments.length > 0 ? (
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{comment.user.username[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{comment.user.username}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at), {
                            addSuffix: true,
                            locale: zhCN,
                          })}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">{comment.number}楼</span>
                        <Button variant="ghost" size="sm" className="h-6">
                          <Icon name="more" className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* 如果有引用，显示引用内容 */}
                    {comment.quote && (
                      <div className="mt-2 rounded-sm border-l-2 border-gray-200 pl-3 text-sm text-muted-foreground">
                        <div className="mb-1 text-xs">
                          引用 {comment.quote.username} 的评论
                        </div>
                        <div>{comment.quote.content}</div>
                      </div>
                    )}

                    <div className="mt-2 text-sm">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                      >
                        {comment.content}
                      </ReactMarkdown>
                    </div>

                    <div className="mt-3 flex items-center space-x-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="h-6 space-x-1 text-xs">
                          <Icon name="favorite" className="text-base" />
                          <span>{comment.likes}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 space-x-1 text-xs">
                          <Icon name="chat" className="text-base" />
                          <span>{comment.replies}</span>
                        </Button>
                      </div>
                      <Button variant="ghost" size="sm" className="h-6 text-xs space-x-1">
                        <Icon name="reply" className="text-base" />
                        <span>回复</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              暂无评论
            </div>
          )}

          {/* 评论框 */}
          <div className="mt-6 flex items-start space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>无</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <PostEditor
                content={commentContent}
                onChange={setCommentContent}
                className="rounded-lg border border-gray-200 bg-background"
                onImageUpload={async (file) => {
                  const formData = new FormData();
                  formData.append("image", file);
                  formData.append("attachment_type", "comment_images");

                  try {
                    const response = await http.post(API_ROUTES.UPLOAD.IMAGE, formData);
                    // You can still use the response data here if needed
                    // but don't return it
                  } catch (error) {
                    console.error("Failed to upload image:", error);
                  }
                }}
              />
              <div className="mt-2 flex justify-end">
                <Button
                  size="sm"
                  onClick={async () => {
                    if (!commentContent.trim()) {
                      return;
                    }

                    try {
                      const response = await http.post(`/api/discussion/posts`, {
                        slug: discussion.slug,
                        content: commentContent.trim(),
                      });

                      if (response.code === 0) {
                        setCommentContent("");
                        // 刷新评论列表
                        const commentsRes = await http.get(
                          `/api/discussion/posts?slug=${encodeURIComponent(slug)}`
                        );
                        if (commentsRes.code === 0) {
                          setComments(commentsRes.data.items);
                        }
                      }
                    } catch (error) {
                      console.error("Failed to post comment:", error);
                    }
                  }}
                >
                  发布评论
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧边栏 */}
      <div className="sticky top-4 w-64 flex-none">
        <DiscussionSidebar />
      </div>
    </div>
  );
}
