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
          "min-h-[100px] w-full text-base leading-7 text-foreground overflow-hidden",
          "break-words [word-break:break-word] [overflow-wrap:anywhere]",

          // 基础文本样式
          "[&_p]:mb-4 [&_p]:last:mb-0",
          "[&_p]:[word-break:break-word] [&_p]:[overflow-wrap:anywhere]",
          "[&_ul]:mb-4 [&_ul]:pl-6 [&_ul]:list-disc [&_ul]:[word-break:break-word]",
          "[&_ol]:mb-4 [&_ol]:pl-6 [&_ol]:list-decimal [&_ol]:[word-break:break-word]",

          // 标题样式
          "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-4 [&_h1]:[word-break:break-word]",
          "[&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:[word-break:break-word]",
          "[&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-4 [&_h2]:mb-2 [&_h3]:[word-break:break-word]",

          // 引用样式
          "[&_blockquote]:border-l-4 [&_blockquote]:border-primary/50",
          "[&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4",
          "[&_blockquote]:text-muted-foreground [&_blockquote]:[word-break:break-word]",

          // 分割线样式
          "[&_hr]:my-8 [&_hr]:border-t [&_hr]:border-border",

          // 代码相关样式
          "[&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-[90%]",
          "[&_:not(pre)>code]:bg-muted/30 [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5",
          "[&_:not(pre)>code]:rounded [&_:not(pre)>code]:border [&_:not(pre)>code]:border-muted/20",
          "[&_:not(pre)>code]:[word-break:break-all]",

          // 代码块样式
          "[&_pre]:bg-muted/30 [&_pre]:px-3 [&_pre]:py-2 [&_pre]:rounded-md",
          "[&_pre]:border [&_pre]:border-muted/20",
          "[&_pre]:overflow-x-auto [&_pre]:text-[90%]",
          "[&_pre]:whitespace-pre [&_pre]:scrollbar-thin [&_pre]:scrollbar-thumb-border [&_pre]:scrollbar-track-muted/30",

          "[&_pre>code]:p-0 [&_pre>code]:bg-transparent",
          "[&_pre>code]:border-0 [&_pre>code]:block",
          "[&_pre>code]:max-h-[50vh]",

          // 表格样式
          "[&_table]:w-full [&_table]:my-4 [&_table]:border-collapse",
          "[&_th]:border [&_th]:p-2 [&_th]:bg-muted/50 [&_th]:[word-break:break-word]",
          "[&_td]:border [&_td]:p-2 [&_td]:[word-break:break-word]",

          // 链接样式
          "[&_a:not(.mention)]:text-primary [&_a:not(.mention)]:underline-offset-4",
          "[&_a:not(.mention)]:hover:underline [&_a:not(.mention)]:[word-break:break-all]",

          className
        )}
        components={{
          a: ({ href, children, ...props }) => {
            // 用户提及链接
            if (href?.startsWith("@")) {
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

            // YouTube 视频嵌入
            const youtubeMatch = href?.match(youtubeRegex);
            if (youtubeMatch) {
              return (
                <div className="relative w-full pt-[56.25%] my-4 rounded-md overflow-hidden">
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeMatch[1]}`}
                    className="absolute top-0 left-0 w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
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
        }}
      >
        {content}
      </ReactMarkdown>
    ),
    [content, className]
  );

  return markdown;
}
