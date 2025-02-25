"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useDiscussionStore } from "@/store/discussion";
import { useSession } from "next-auth/react";
import { DiscussionSidebar } from "@/components/discussion/discussion-sidebar";
import { Editor } from "@/components/editor/Editor";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import type { Discussion, Pagination, Post } from "@/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ThumbsUp, ThumbsDown, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useLoginModal } from "@/components/providers/login-modal-provider";
import { PostContent } from "@/components/post/post-content";
import { api } from "@/lib/api";
import { AttachmentType } from "@/constants/attachment-type";
import { Preview } from "@/components/editor/Preview"; // Add Preview component import
import { toast } from "@/components/ui/use-toast"; // Add toast import
import { useState } from "react"; // Add useState import

interface DiscussionDetailProps {
  initialDiscussion: Discussion;
}

export function DiscussionDetail({ initialDiscussion }: DiscussionDetailProps) {
  const params = useParams();
  // Ensure params.slug exists and is a string
  const slug = params?.slug as string;
  if (!slug) {
    return <div>Invalid discussion URL</div>;
  }
  const { currentDiscussion, setDiscussion } = useDiscussionStore();
  const { data: session } = useSession();
  const user = session?.user;
  const { openLoginModal } = useLoginModal();
  const [commentContent, setCommentContent] = React.useState("");

  const [replyTo, setReplyTo] = React.useState<any | null>(null);
  const editorRef = React.useRef<any>(null);
  const [comments, setComments] = React.useState<Pagination<Post>>({
    items: [],
    code: 0,
    total: 0,
    per_page: 0,
    current_page: 0,
    last_page: 0,
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false); // Add isSubmitting state

  React.useEffect(() => {
    setDiscussion(initialDiscussion);
  }, [initialDiscussion, setDiscussion]);

  // 初始化评论列表
  React.useEffect(() => {
    const fetchComments = async () => {
      if (!currentDiscussion) return;
      try {
        const data = await api.discussions.posts({ slug });
        setComments(data);
      } catch (error) {
        console.error("Failed to fetch comments:", error);
      }
    };

    fetchComments();
  }, [currentDiscussion]);

  const handleReplyClick = (comment: Post) => {
    if (!user) {
      openLoginModal();
      return;
    }
    setReplyTo(comment);
    // 滚动到评论框
    document.getElementById("comment")?.scrollIntoView({ behavior: "smooth" });
    // 设置编辑器焦点
    editorRef.current?.focus?.();
  };

  const handleSubmitComment = async (content: string) => {
    if (!content.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const data = await api.discussions.createPost({
        slug: currentDiscussion?.slug,
        content: content.trim(),
        parent_id: replyTo?.id,
        quote: replyTo
          ? {
              username: replyTo.user.username,
              content: replyTo.content,
            }
          : undefined,
      });

      setCommentContent("");
      setReplyTo(null);
      // 重置编辑器内容
      editorRef.current?.reset?.();
      // 刷新评论列表
      const commentsData = await api.discussions.posts({ slug });
      setComments(commentsData);
    } catch (err) {
      console.error("Failed to post comment:", err);
      // 显示错误提示
      toast({
        title: "评论失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentDiscussion) {
    return null;
  }

  return (
    // <div className=" ml-4 min-w-0 w-0">
    <div className="flex flex-col lg:flex-row gap-4 md:gap-6 mb-4 md:mb-8">
      {/* 主内容区 */}
      <div className="flex-1 min-w-0">
        {/* 贴文头部信息 */}
        <div className="border-b pb-4 flex-1 max-w-4xl">
          <div className="w-full">
            <h2 className="text-xl md:text-2xl font-medium overflow-hidden text-ellipsis whitespace-nowrap">
              {currentDiscussion.title}
            </h2>
          </div>

          <div className="mt-2 flex items-start space-x-3">
            <Avatar className="h-10 w-10 md:h-14 md:w-14 flex-shrink-0">
              <AvatarImage
                src={currentDiscussion.user.avatar_url}
                alt={currentDiscussion.user.username}
              />
              <AvatarFallback>
                {currentDiscussion.user.username[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="flex items-center space-x-2">
                <span className="text-base md:text-lg font-medium truncate">
                  {currentDiscussion.user.username}
                </span>
                <span className="flex-shrink-0 mx-2 text-gray-300">·</span>
                <span className="text-xs md:text-sm text-gray-500 flex-shrink-0">
                  {formatDistanceToNow(new Date(currentDiscussion.created_at), {
                    addSuffix: true,
                    locale: zhCN,
                  })}
                </span>
              </div>
              <div className="text-xs text-muted-foreground truncate">
                <span>来自 {currentDiscussion.board.name}</span>
                <span> # {currentDiscussion.board_child.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 贴文内容 */}
        <div className="pt-4 px-2 md:px-4 text-muted-foreground w-full text-base">
          <PostContent post={currentDiscussion.main_post} />
        </div>

        {/* 贴文底部操作栏 */}
        <div className="mt-6 flex items-center justify-between border-b">
          <div className="flex items-center py-2 md:py-4">
            <span>评论</span>
            <span className="w-2"></span>
            <span className="text-blue-600">
              {currentDiscussion.comment_count}
            </span>
          </div>
        </div>

        {/* 评论区 */}
        <div className="mt-4">
          {/* 评论列表 */}
          {comments?.items.length > 0 ? (
            <div className="space-y-2 md:space-y-4">
              {comments.items.map((comment) => (
                <div key={comment.id} className="pt-2 pb-4 border-b">
                  <div className="flex items-start space-x-3 px-2 md:px-4 min-w-0">
                    <Avatar className="h-8 w-8 md:h-12 md:w-12 flex-shrink-0">
                      <AvatarImage src={comment.user.avatar_url} />
                      <AvatarFallback>
                        {comment.user.nickname[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="font-medium text-sm md:text-base truncate">
                          {comment.user.nickname || comment.user.username}
                        </span>
                        <span className="text-gray-300">·</span>
                        <span className="text-xs md:text-sm text-gray-500">
                          {formatDistanceToNow(new Date(comment.created_at), {
                            addSuffix: true,
                            locale: zhCN,
                          })}
                        </span>
                      </div>

                      {/* 评论内容 */}
                      <div className="mt-1 text-gray-900 min-w-0">
                        {comment.parent_post && (
                          <Link
                            href={`#comment-${comment.parent_post.user.hashid}`}
                            className="inline-block mb-2 text-xs md:text-sm text-muted-foreground"
                          >
                            @{comment.parent_post.user.username}{" "}
                          </Link>
                        )}
                        <div className="w-full text-base">
                          <PostContent post={comment} />
                        </div>
                      </div>

                      {/* 评论操作 */}
                      <div className="mt-3 flex justify-between items-center space-x-4 text-sm md:text-base text-gray-500">
                        <div className="flex items-center gap-2 space-x-4 md:space-x-8">
                          <div className="flex items-center h-6 space-x-1 cursor-pointer">
                            <ThumbsUp className="h-3 w-3 md:h-4 md:w-4" />
                            <span className="text-xs md:text-sm">{}</span>
                          </div>
                          <div className="flex items-center h-6 space-x-1 cursor-pointer">
                            <ThumbsDown className="h-3 w-3 md:h-4 md:w-4" />
                            <span className="text-xs md:text-sm">{}</span>
                          </div>
                        </div>

                        <div className="flex items-center h-6 space-x-4 md:space-x-8">
                          <button
                            className="text-xs md:text-sm cursor-pointer hover:text-primary"
                            onClick={() => handleReplyClick(comment)}
                          >
                            回复
                          </button>
                          <MoreHorizontal className="h-3 w-3 md:h-4 md:w-4 cursor-pointer" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !commentContent && (
              <div className="flex items-center justify-center py-6 md:py-8 text-sm md:text-base text-muted-foreground">
                暂无评论
              </div>
            )
          )}

          {/* 评论预览 */}
          {user && commentContent && (
            <div className="mt-6 pt-2 pb-4 border-b">
              <div className="flex items-start space-x-3 px-2 md:px-4 min-w-0">
                <Avatar className="h-8 w-8 md:h-12 md:w-12 flex-shrink-0">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback>
                    {user.name?.[0] || user.email?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className="flex items-center">
                    <span className="font-medium text-sm md:text-base truncate">
                      {user.nickname || user.username}
                    </span>
                  </div>
                  {/* 预览内容 */}
                  <div className="mt-1 text-gray-900 text-base break-words">
                    <Preview content={commentContent} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 评论编辑器 */}
          {!user ? (
            <div className="mt-6 w-full flex justify-center p-8">
              <span>请</span>
              <span
                className="text-primary cursor-pointer"
                onClick={() => openLoginModal()}
              >
                登录
              </span>
              <span>后发表评论</span>
            </div>
          ) : (
            <div id="comment" className="flex flex-col mt-6 min-h-[260px]">
              {replyTo && (
                <div className="mb-2 px-4 py-2 bg-muted/50 rounded-md flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    回复 @{replyTo.user.username}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2"
                    onClick={() => setReplyTo(null)}
                  >
                    取消回复
                  </Button>
                </div>
              )}
              <Editor
                ref={editorRef}
                className="flex-grow"
                attachmentType={AttachmentType.TOPIC}
                placeholder={
                  replyTo
                    ? `回复 @${replyTo.user.username}...`
                    : "写下你的评论..."
                }
                initialContent={commentContent}
                onChange={setCommentContent}
              />
              <div className="mt-2 flex items-center justify-between">
                <div></div>
                <Button
                  size="sm"
                  onClick={() => handleSubmitComment(commentContent)}
                  disabled={isSubmitting || !commentContent.trim()}
                >
                  {isSubmitting ? "发送中..." : "发送"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 右侧边栏 */}
      <aside className="hidden lg:block sticky top-4 w-full lg:w-40 xl:w-60 flex-shrink-0 pl-8">
        <Sidebar />
      </aside>
    </div>
    // </div>
  );
}
const Sidebar = React.memo(DiscussionSidebar);
