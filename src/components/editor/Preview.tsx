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
        className={cn(
          "min-h-[100px] w-full text-sm leading-7 text-foreground",
          // 基础文本样式
          "[&_p]:mb-4 [&_p]:last:mb-0",
          "[&_ul]:mb-4 [&_ul]:pl-6 [&_ul]:list-disc",
          "[&_ol]:mb-4 [&_ol]:pl-6 [&_ol]:list-decimal",
          // 标题样式
          "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-4",
          "[&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3",
          "[&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2",
          // 引用样式
          "[&_blockquote]:border-l-4 [&_blockquote]:border-primary/50",
          "[&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4",
          "[&_blockquote]:text-muted-foreground",
          // 分割线样式
          "[&_hr]:my-8 [&_hr]:border-t [&_hr]:border-border",
          className
        )}
        components={{
          // 自定义链接渲染
          a: ({ node, href, children, ...props }) => {
            const isMention = href?.startsWith("@");
            if (isMention) {
              return (
                <a
                  {...props}
                  href={`/users/${href?.slice(1)}`}
                  className="inline-flex items-center text-primary hover:underline mention bg-primary/10 px-1.5 py-0.5 rounded hover:bg-primary/20"
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
                className="text-primary underline-offset-4 hover:underline"
              >
                {children}
              </a>
            );
          },
          // 自定义代码块渲染
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            return !inline ? (
              <pre className="bg-muted/30 p-4 rounded-md border border-muted/20 overflow-x-auto text-[90%]">
                <code
                  className={cn(
                    "block p-0 bg-transparent border-0 max-h-[50vh] min-h-[250px]",
                    match && `language-${match[1]}`,
                    className
                  )}
                  {...props}
                >
                  {children}
                </code>
              </pre>
            ) : (
              <code
                className={cn(
                  "font-mono text-[90%] bg-muted/30 px-2 py-1 rounded border border-muted/20",
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
                className="w-full my-4 border-collapse"
              />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th
              {...props}
              className="border p-2 bg-muted/50"
            />
          ),
          td: ({ node, ...props }) => (
            <td {...props} className="border p-2" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    ),
    [content, className]
  );

  return markdown;
}
