"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LayoutGrid, ChevronDown, MessageSquare, Heart, List, ThumbsUp } from "lucide-react";
import type { Discussion } from "@/types/discussion";
import { http } from "@/lib/request";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { Icon } from "@/components/icons";
import { UserLink } from "@/components/markdown/user-link";

export default function HomePage() {
  const [discussions, setDiscussions] = React.useState<Discussion[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [displayMode, setDisplayMode] = React.useState<'image-text' | 'text-only'>('image-text');
  const loadingRef = React.useRef(false);
  const observerRef = React.useRef<IntersectionObserver>();
  const lastItemRef = React.useRef<HTMLElement>(null);

  const fetchDiscussions = React.useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      const response = await http.get(
        `/api/discussions?page=${page}&per_page=10`
      );

      if (response.code === 0) {
        setDiscussions((prev) => [...prev, ...response.data.items]);
        setHasMore(response.data.current_page < response.data.last_page);
      }
    } catch (error) {
      console.error("Failed to fetch discussions:", error);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [page]);

  const toggleDisplayMode = () => {
    setDisplayMode(prev => prev === 'image-text' ? 'text-only' : 'image-text');
  };

  React.useEffect(() => {
    fetchDiscussions();
  }, [fetchDiscussions]);

  React.useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
          setPage((p) => p + 1);
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current = observer;

    if (lastItemRef.current) {
      observer.observe(lastItemRef.current);
    }

    return () => {
      if (lastItemRef.current) {
        observer.unobserve(lastItemRef.current);
      }
    };
  }, [hasMore, discussions.length]);

  return (
    <div className="flex flex-col">
      {/* 顶部导航 */}
      <div className="bg-background">
        <div className="mx-auto">
          <div className="flex h-[40px] items-center justify-between border-b">
            <div className="flex items-center space-x-8">
              <Button
                variant="ghost"
                className="h-8 px-1 font-medium text-primary hover:bg-transparent hover:text-primary"
              >
                推荐
              </Button>
              <Button
                variant="ghost"
                className="h-8 px-1 font-medium text-muted-foreground hover:bg-transparent hover:text-foreground"
              >
                追踪
              </Button>
              <Button
                variant="ghost"
                className="h-8 px-1 font-medium text-muted-foreground hover:bg-transparent hover:text-foreground"
              >
                标签
              </Button>
              <Button
                variant="ghost"
                className="h-8 px-1 font-medium text-muted-foreground hover:bg-transparent hover:text-foreground"
              >
                标签
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 space-x-2 text-muted-foreground hover:bg-transparent hover:text-foreground"
              >
                热门
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-muted-foreground hover:bg-transparent hover:text-foreground"
                onClick={toggleDisplayMode}
              >
                {displayMode === 'image-text' ? (
                  <LayoutGrid className="h-4 w-4" />
                ) : (
                  <List className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 帖子列表 */}
      <div className="mx-auto">
        <div className="divide-y">
          {discussions.map((discussion, index) => (
            <article
              key={discussion.slug}
              ref={index === discussions.length - 1 ? lastItemRef : null}
              className="py-4"
            >
              <div className="flex space-x-3">
                {/* 作者头像 */}
                <Avatar className="h-12 w-12 flex-shrink-0">
                  <AvatarImage src={discussion.user.avatar_url} alt={discussion.user.username} />
                  <AvatarFallback>{discussion.user.username[0]}</AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/discussions/${discussion.slug}`}
                      className="text-sm font-medium text-foreground hover:text-primary"
                    >
                      {discussion.title}
                    </Link>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(
                        new Date(discussion.main_post.created_at),
                        {
                          addSuffix: true,
                          locale: zhCN,
                        }
                      )}
                    </span>
                  </div>

                  <div className="mt-1">
                    {displayMode === 'image-text' ? (
                      <div className="flex gap-3 items-start">
                        {(() => {
                          // 使用更精确的正则表达式匹配图片URL
                          const regex = /!\[(?:.*?)\]\((https?:\/\/[^)]+)\)/;
                          const matches = discussion.main_post.content.match(regex);
                          const imgUrl = matches ? matches[1].split(' ')[0] : null; // 处理可能带有标题的URL
                          
                          return imgUrl ? (
                            <div className="flex-shrink-0">
                              <Image
                                src={imgUrl}
                                alt=""
                                width={120}
                                height={80}
                                className="object-cover"
                              />
                            </div>
                          ) : null;
                        })()}
                        <div className="flex-1 text-sm text-muted-foreground line-clamp-3">
                          <ReactMarkdown
                            skipHtml={false}
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[
                              rehypeRaw,
                              [
                                rehypeSanitize,
                                {
                                  attributes: {
                                    "*": ["className", "style", "class"],
                                    a: [
                                      "href",
                                      "title",
                                      "target",
                                      "rel",
                                      "className",
                                      "class",
                                    ],
                                  },
                                  protocols: {
                                    href: ["http", "https", "mailto", "tel"],
                                  },
                                  tagNames: [
                                    "div",
                                    "p",
                                    "a",
                                    "span",
                                    "h1",
                                    "h2",
                                    "h3",
                                    "h4",
                                    "h5",
                                    "h6",
                                  ],
                                },
                              ],
                            ]}
                            className="prose prose-sm max-w-none [&>p]:!m-0"
                            components={{
                              img: () => null,
                              iframe: () => null,
                              a: ({ href, children }) => {
                                // 如果是 YouTube 链接，返回 null
                                if (href?.includes('youtube.com') || href?.includes('youtu.be')) {
                                  return null;
                                }
                                return <UserLink href={href || ""}>{children}</UserLink>;
                              },
                              p: ({ children }) => {
                                // 如果段落只包含被跳过的元素（图片或 YouTube），则不渲染该段落
                                const hasContent = React.Children.toArray(children).some(
                                  child => typeof child === 'string' && child.trim() !== ''
                                );
                                return hasContent ? <p className="!m-0">{children}</p> : null;
                              },
                            }}
                          >
                            {discussion.main_post.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    ) : (
                      <div className="text-md text-muted-foreground">
                        <ReactMarkdown
                          skipHtml={false}
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[
                            rehypeRaw,
                            [
                              rehypeSanitize,
                              {
                                attributes: {
                                  "*": ["className", "style", "class"],
                                  a: [
                                    "href",
                                    "title",
                                    "target",
                                    "rel",
                                    "className",
                                    "class",
                                  ],
                                },
                                protocols: {
                                  href: ["http", "https", "mailto", "tel"],
                                },
                                tagNames: [
                                  "div",
                                  "p",
                                  "a",
                                  "span",
                                  "h1",
                                  "h2",
                                  "h3",
                                  "h4",
                                  "h5",
                                  "h6",
                                ],
                              },
                            ],
                          ]}
                          className="prose prose-sm max-w-none [&>p]:!m-0"
                          components={{
                            img: () => null,
                            iframe: () => null,
                            a: ({ href, children }) => {
                              // 如果是 YouTube 链接，返回 null
                              if (href?.includes('youtube.com') || href?.includes('youtu.be')) {
                                return null;
                              }
                              return <UserLink href={href || ""}>{children}</UserLink>;
                            },
                            p: ({ children }) => {
                              // 如果段落只包含被跳过的元素（图片或 YouTube），则不渲染该段落
                              const hasContent = React.Children.toArray(children).some(
                                child => typeof child === 'string' && child.trim() !== ''
                              );
                              return hasContent ? <p className="!m-0">{children}</p> : null;
                            },
                          }}
                        >
                          {discussion.main_post.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex items-center space-x-4 text-xs">
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Icon
                        name="thumb_up"
                        className="h-4 w-4 text-base cursor-pointer"
                      />
                      <span>{discussion.votes}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Icon
                        name="mode_comment"
                        className="h-4 w-4 text-base cursor-pointer"
                      />
                      <span>{discussion.comment_count}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <span>{discussion.diff_humans}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <span>来自 {discussion.board.name}</span>{" "}
                      <span>#{discussion.board_child.name}</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">
            加载中...
          </div>
        ) : !hasMore && discussions.length > 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            没有更多了
          </div>
        ) : discussions.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            这里空空如也
          </div>
        ) : null}
      </div>
    </div>
  );
}
