// src/components/editor/Preview.tsx
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { cn } from "@/lib/utils";

interface PreviewProps {
  content: string;
  className?: string;
}

const youtubeRegex = /https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([^&\s]+)/;

export function Preview({ content, className }: PreviewProps) {
  // 使用 useMemo 缓存渲染结果，避免不必要的重渲染
  const markdown = React.useMemo(
    () => (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
          // 自定义链接渲染
          a: ({ node, href, children, ...props }) => {
            const isMention = href?.startsWith("@");
            if (isMention) {
              return (
                <a
                  {...props}
                  href={`/users/${href?.slice(1)}`}
                  className="inline-flex items-center text-primary hover:underline"
                >
                  {children}
                </a>
              );
            }
            return (
              <a
                {...props}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              />
            );
          },
          // 自定义代码块渲染
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            return !inline ? (
              <pre className="relative group">
                <code
                  className={cn(
                    "block overflow-x-auto p-4 rounded-lg bg-muted",
                    match && `language-${match[1]}`,
                    className
                  )}
                  {...props}
                >
                  {children}
                </code>
                {/* 可以在这里添加复制按钮 */}
              </pre>
            ) : (
              <code
                className={cn(
                  "bg-muted px-1.5 py-0.5 rounded text-sm",
                  className
                )}
                {...props}
              >
                {children}
              </code>
            );
          },
          // 自定义图片渲染
          img: ({ node, ...props }) => (
            <img
              {...props}
              className="rounded-lg max-h-[600px] mx-auto"
              loading="lazy"
            />
          ),
          // 自定义表格渲染
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto">
              <table
                {...props}
                className="w-full border-collapse border border-border"
              />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th
              {...props}
              className="border border-border p-2 bg-muted font-semibold"
            />
          ),
          td: ({ node, ...props }) => (
            <td {...props} className="border border-border p-2" />
          ),
          p: ({ children }) => {
            const child = children[0];
            if (typeof child === 'string') {
              const match = child.match(youtubeRegex);
              if (match) {
                return (
                  <iframe
                    width="560"
                    height="315"
                    src={`https://www.youtube.com/embed/${match[1]}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                );
              }
            }
          },
        }}
      >
        {content}
      </ReactMarkdown>
    ),
    [content]
  );

  return (
    <div
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none",
        "min-h-[200px] p-3 rounded-md border bg-muted",
        // 自定义 prose 样式
        "prose-headings:scroll-mt-20",
        "prose-pre:p-0 prose-pre:bg-transparent",
        "prose-img:rounded-lg prose-img:max-h-[600px]",
        "prose-blockquote:border-l-4 prose-blockquote:border-primary",
        "prose-blockquote:pl-4 prose-blockquote:italic",
        "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
        className
      )}
    >
      {markdown}
    </div>
  );
}
