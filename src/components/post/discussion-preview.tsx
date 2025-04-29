"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface DiscussionPreviewProps {
  content: string; // 已经渲染好的 HTML
  displayMode: "grid" | "list";
  className?: string;
}

export function DiscussionPreview({
  content,
  displayMode,
  className,
}: DiscussionPreviewProps) {
  // 从 HTML 中提取第一张图片并移除所有图片
  const processContent = React.useCallback((html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // 获取第一张图片的 URL
    const firstImg = doc.querySelector("img");
    const firstImgSrc = firstImg?.src;

    // 移除所有图片
    doc.querySelectorAll("img").forEach((img) => img.remove());

    // 返回处理后的内容和第一张图片 URL
    return {
      processedContent: doc.body.innerHTML,
      firstImgSrc,
    };
  }, []);

  // 使用 useMemo 缓存处理结果
  const { processedContent, firstImgSrc } = React.useMemo(
    () => processContent(content),
    [content, processContent]
  );

  return (
    <div className={className}>
      {displayMode === "grid" ? (
        <div className="flex gap-3 items-start mt-2">
          {firstImgSrc && (
            <div className="flex-shrink-0">
              <Image
                src={firstImgSrc}
                alt=""
                width={120}
                height={80}
                className="object-cover rounded-lg"
              />
            </div>
          )}
          <div
            className={cn(
              "flex-1 text-sm line-clamp-3 whitespace-pre-line",
              "prose-sm prose-a:text-primary max-w-none [&>p]:!m-0",
              "[&_a:not(.mention)]:text-primary [&_a:not(.mention)]:underline-offset-4",
              "[&_a:not(.mention)]:hover:underline",
              "[&_.mention]:text-primary [&_.mention]:font-medium",
              "[&_.mention]:bg-primary/10 [&_.mention]:px-1.5 [&_.mention]:py-0.5",
              "[&_.mention]:rounded [&_.mention]:hover:bg-primary/20"
            )}
            dangerouslySetInnerHTML={{ __html: processedContent }}
          />
        </div>
      ) : (
        <div
          className={cn(
            "mt-2 text-sm line-clamp-2",
            "prose-sm prose-a:text-primary max-w-none [&>p]:!m-0",
            "[&_a:not(.mention)]:text-primary [&_a:not(.mention)]:underline-offset-4",
            "[&_a:not(.mention)]:hover:underline",
            "[&_.mention]:text-primary [&_.mention]:font-medium",
            "[&_.mention]:bg-primary/10 [&_.mention]:px-1.5 [&_.mention]:py-0.5",
            "[&_.mention]:rounded [&_.mention]:hover:bg-primary/20"
          )}
          dangerouslySetInnerHTML={{ __html: processedContent }}
        />
      )}
    </div>
  );
}
