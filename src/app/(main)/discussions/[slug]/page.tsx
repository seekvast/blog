"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Share2, MoreHorizontal } from "lucide-react";
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

  React.useEffect(() => {
    const fetchDiscussion = async () => {
      if (!slug) return;

      try {
        const response = await http.get(
          `/api/discussion?slug=${encodeURIComponent(slug)}`
        );
        console.log("Discussion API response:", response);

        if (response.code == 0) {
          setDiscussion(response.data);
          console.log("Discussion.....................:", discussion);
        } else {
          console.log("API returned error code:", response.data.code);
          setDiscussion(null);
        }
      } catch (error) {
        console.error("Failed to fetch discussion:", error);
        setDiscussion(null);
      } finally {
        setLoading(false);
      }
    };

    const fetchComments = async () => {
      if (!slug) return;

      try {
        const response = await http.get(
          `/api/discussion/posts?slug=${encodeURIComponent(slug)}`
        );
        console.log("Comments API response:", response.data);
        if (response.code === 0) {
          setComments(response.data.items);
        }
      } catch (error) {
        console.error("Failed to fetch comments:", error);
      }
    };

    fetchDiscussion();
    fetchComments();
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
        <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <Heart className="h-4 w-4" />
              <span>{discussion.votes}</span>
            </div>
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span>{discussion.comment_count}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="h-7">
              <Share2 className="mr-1 h-4 w-4" />
              分享
            </Button>
            <Button variant="ghost" size="sm" className="h-7">
              <MoreHorizontal className="h-4 w-4" />
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
                          <MoreHorizontal className="h-4 w-4" />
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
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="sm" className="h-6 space-x-1 text-xs">
                          <Heart className="h-3 w-3" />
                          <span>{comment.likes}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 space-x-1 text-xs">
                          <MessageSquare className="h-3 w-3" />
                          <span>{comment.replies}</span>
                        </Button>
                      </div>
                      <Button variant="ghost" size="sm" className="h-6 text-xs">
                        回复
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
            <div className="flex-1 rounded-lg border bg-white">
              <div className="flex items-center justify-between border-b px-4 py-2">
                <div className="text-sm text-muted-foreground">说两句吧~</div>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm" className="h-6 px-2">
                    <span className="text-lg">B</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 px-2">
                    <span className="text-lg">U</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 px-2">
                    <span className="text-lg">I</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 px-2">
                    <span className="text-lg">"</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 px-2">
                    <span className="text-lg">@</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 px-2">
                    <span className="text-lg">?</span>
                  </Button>
                </div>
              </div>
              <textarea
                className="w-full resize-none border-0 bg-transparent p-4 text-sm focus:outline-none focus:ring-0"
                rows={3}
                placeholder="请输入评论内容..."
              />
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
