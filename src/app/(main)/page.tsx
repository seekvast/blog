"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LayoutGrid, ChevronDown, MessageSquare, Heart } from "lucide-react";
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
              >
                <LayoutGrid className="h-4 w-4" />
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

                  {/* <div className="space-y-2">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      className="prose prose-sm max-w-none break-words"
                      components={{
                        a: ({ href, children }) => (
                          <UserLink href={href || ""}>{children}</UserLink>
                        ),
                      }}
                    >
                      {discussion.excerpt}
                    </ReactMarkdown>
                  </div> */}

                  <div className="mt-1 text-md text-muted-foreground">
                    <ReactMarkdown
                      skipHtml={false} 
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw, [rehypeSanitize, {
                        attributes: {
                          '*': ['className', 'style', 'class'],
                          'img': ['src', 'alt', 'title', 'width', 'height', 'loading', 'class', 'className', 'ref', 'onLoad'],
                          'iframe': ['src', 'allow', 'allowfullscreen', 'frameborder', 'loading', 'class', 'className', 'width', 'height', 'style'],
                          'span': ['className', 'class', 'style'],
                          'div': ['className', 'class', 'style'],
                          'a': ['href', 'title', 'target', 'rel', 'className', 'class']
                        },
                        protocols: {
                          src: ['http', 'https', 'data'],
                          href: ['http', 'https', 'mailto', 'tel']
                        },
                        tagNames: ['div', 'p', 'iframe', 'img', 'a', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']
                      }]]}
                      className="prose prose-sm max-w-none [&>p]:!m-0 [&_iframe]:!mt-2"
                      components={{
                        a: ({ href, children }) => (
                          <UserLink href={href || ""}>{children}</UserLink>
                        ),
                        img: ({ node, ...props }: {
                          node: { tagName: keyof JSX.IntrinsicElements };
                          [key: string]: any;
                        }) => {
                          const { src = "", alt = "", ...rest } = props;
                          return (
                            <img
                              src={src}
                              alt={alt}
                              className="my-0 max-w-full h-auto"
                              {...rest}
                            />
                          );
                        },
                        iframe: ({ node, ...props }: { 
                          node?: any; 
                          src?: string;
                          [key: string]: any;
                        }) => {
                          const { src = "", ...rest } = props;
                          
                          // 处理 YouTube URL
                          let videoSrc = src;
                          if (src.includes('youtube.com') || src.includes('youtu.be')) {
                            // 转换 YouTube URL 为嵌入格式
                            const videoId = src.includes('youtube.com') 
                              ? src.split('v=')[1]?.split('&')[0]
                              : src.split('youtu.be/')[1]?.split('?')[0];
                            if (videoId) {
                              videoSrc = `https://www.youtube.com/embed/${videoId}`;
                            }
                          }
                          
                          return (
                            <div className="mt-3 aspect-video">
                              <iframe
                                src={videoSrc}
                                className="w-full h-full rounded-2xl"
                                style={{ width: '100%', height: '100%' }}
                                frameBorder="0"
                                allowFullScreen
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                loading="lazy"
                              />
                            </div>
                          );
                        },
                        p: ({ node, children, ...props }) => {
                          const hasOnlyImages = React.Children.toArray(
                            children
                          ).every(
                            (child) =>
                              React.isValidElement(child) &&
                              (child.type === "img" ||
                                (typeof child.type === "function" &&
                                  child.type.name === "img"))
                          );

                          if (hasOnlyImages) {
                            const validChildren = React.Children.toArray(children).filter(
                              (child) =>
                                React.isValidElement(child) &&
                                (child.type === "img" ||
                                  (typeof child.type === "function" &&
                                    child.type.name === "img"))
                            );

                            return (
                              <div className="mt-3">
                                <div className="rounded-2xl overflow-hidden">
                                  <div
                                    className={`
                                    grid gap-[2px] items-start
                                    ${
                                      validChildren.length === 1
                                        ? "grid-cols-1"
                                        : ""
                                    }
                                    ${
                                      validChildren.length === 2
                                        ? "grid-cols-2"
                                        : ""
                                    }
                                    ${
                                      validChildren.length === 3
                                        ? "grid-cols-3"
                                        : ""
                                    }
                                    ${
                                      validChildren.length === 4
                                        ? "grid-cols-2 grid-rows-2"
                                        : ""
                                    }
                                  `}
                                  >
                                    {validChildren.map((child, index) => (
                                      <div key={index} className="w-full h-full">
                                        {child}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <p {...props} className="!m-0">
                              {children}
                            </p>
                          );
                        },
                        '*': ({ node, ...props }: { node: { tagName: keyof JSX.IntrinsicElements }; [key: string]: any }) => {
                          const Element = node.tagName;
                          if (props.class) {
                            props.className = props.class;
                            delete props.class;
                          }
                          return <Element {...props} />;
                        },
                      } as Components}
                    >
                      {discussion.main_post.content}
                    </ReactMarkdown>
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
