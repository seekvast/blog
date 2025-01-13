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
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Icon } from "@/components/icons";

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

                  <div className="mt-1 text-md text-muted-foreground">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      className="[&>p]:!m-0 [&_iframe]:!mt-2"
                      components={{
                        img: ({ node, ...props }) => {
                          const imgRef = React.useRef<HTMLImageElement>(null);
                          const [loaded, setLoaded] = React.useState(false);
                          const containerRef =
                            React.useRef<HTMLSpanElement>(null);
                          const [imageCount, setImageCount] = React.useState(0);
                          const [imageIndex, setImageIndex] = React.useState(0);

                          React.useEffect(() => {
                            const parent =
                              containerRef.current?.closest(".image-grid");
                            if (parent) {
                              const images = parent.getElementsByTagName("img");
                              setImageCount(images.length);
                              for (let i = 0; i < images.length; i++) {
                                if (images[i] === imgRef.current) {
                                  setImageIndex(i);
                                  break;
                                }
                              }
                            }
                          }, []);

                          if (!props.src) return null;

                          return (
                            <span
                              ref={containerRef}
                              className={`
                              inline-block relative overflow-hidden
                              ${
                                imageCount === 1
                                  ? "col-span-1 row-span-1 rounded-2xl"
                                  : ""
                              }
                              ${
                                imageCount === 2
                                  ? imageIndex === 0
                                    ? "rounded-l-2xl"
                                    : "rounded-r-2xl"
                                  : ""
                              }
                              ${
                                imageCount === 3
                                  ? imageIndex === 0
                                    ? "col-span-2 rounded-l-2xl"
                                    : imageIndex === 1
                                    ? "rounded-tr-2xl"
                                    : "rounded-br-2xl"
                                  : ""
                              }
                              ${
                                imageCount === 4
                                  ? imageIndex === 0
                                    ? "rounded-tl-2xl"
                                    : imageIndex === 1
                                    ? "rounded-tr-2xl"
                                    : imageIndex === 2
                                    ? "rounded-bl-2xl"
                                    : "rounded-br-2xl"
                                  : ""
                              }
                            `}
                            >
                              <span
                                className="block relative pb-[100%]"
                                style={{
                                  backgroundColor: "rgb(239, 243, 244)",
                                }}
                              >
                                <span className="absolute inset-0">
                                  <span
                                    className={`block w-full h-full transition-opacity duration-200 ${
                                      loaded ? "opacity-100" : "opacity-0"
                                    }`}
                                  >
                                    <img
                                      {...props}
                                      ref={imgRef}
                                      onLoad={() => setLoaded(true)}
                                      className="w-full h-full object-cover"
                                      loading="lazy"
                                      alt={props.alt || ""}
                                    />
                                  </span>
                                </span>
                              </span>
                            </span>
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
                                  child.props.src))
                          );

                          if (hasOnlyImages) {
                            const validChildren = React.Children.toArray(
                              children
                            ).filter(
                              (child) =>
                                React.isValidElement(child) &&
                                (child.type === "img" ||
                                  (typeof child.type === "function" &&
                                    child.props.src))
                            );

                            return (
                              <div className="mt-3 overflow-hidden">
                                <div className="rounded-2xl overflow-hidden">
                                  <div
                                    className={`
                                    image-grid grid gap-[2px]
                                    ${
                                      validChildren.length === 1
                                        ? "grid-cols-1 grid-rows-1"
                                        : ""
                                    }
                                    ${
                                      validChildren.length === 2
                                        ? "grid-cols-2 grid-rows-1"
                                        : ""
                                    }
                                    ${
                                      validChildren.length === 3
                                        ? "grid-cols-2 grid-rows-2"
                                        : ""
                                    }
                                    ${
                                      validChildren.length === 4
                                        ? "grid-cols-2 grid-rows-2"
                                        : ""
                                    }
                                  `}
                                    style={{
                                      backgroundColor: "rgb(239, 243, 244)",
                                    }}
                                  >
                                    {validChildren}
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <p {...props} className="!m-0 line-clamp-2">
                              {children}
                            </p>
                          );
                        },
                        iframe: ({ node, ...props }) => {
                          return (
                            <div className="mt-3 aspect-video rounded-2xl overflow-hidden">
                              <iframe {...props} className="w-full h-full" />
                            </div>
                          );
                        },
                      }}
                    >
                      {discussion.main_post.content}
                    </ReactMarkdown>
                  </div>

                  {/* <div className="mt-2 flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <span>{discussion.board.name}</span>
                      {discussion.board_child && (
                        <>
                          <span>/</span>
                          <span>{discussion.board_child.name}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center space-x-4">
                      <span>{discussion.view_count} 次浏览</span>
                      <span>{discussion.comment_count} 条评论</span>
                      <span>{discussion.votes} 个赞</span>
                    </div>
                  </div> */}
                  <div className="mt-3 flex items-center space-x-4 text-xs">
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Icon name="thumb_up" className="h-4 w-4 text-base cursor-pointer" />
                      <span>{discussion.votes}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Icon name="mode_comment" className="h-4 w-4 text-base cursor-pointer" />
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
