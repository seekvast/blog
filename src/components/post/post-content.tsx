"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { MainPost } from "@/types";

interface PostContentProps {
  post: MainPost;
  className?: string;
}

export function PostContent({ post, className }: PostContentProps) {
  const contentRef = React.useRef<HTMLDivElement>(null);

  // 在组件挂载和更新时执行脚本
  React.useEffect(() => {
    if (!contentRef.current) return;

    // 执行内容中的脚本（如语法高亮等）
    const scripts = contentRef.current.getElementsByTagName('script');
    Array.from(scripts).forEach(oldScript => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach(attr => 
        newScript.setAttribute(attr.name, attr.value)
      );
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  }, [post.content]);

  // 如果没有渲染好的 HTML，显示加载状态
  if (!post.content) {
    return (
      <div className={cn(
        "min-h-[100px] p-3 rounded-md border bg-muted animate-pulse",
        className
      )} />
    );
  }

  return (
    <article
      ref={contentRef}
      className={cn(
        // 基础样式
        "prose prose-sm dark:prose-invert max-w-none",
        "min-h-[100px] w-full",
        
        // 标题样式
        "prose-headings:scroll-mt-20 prose-headings:font-semibold",
        "prose-h1:text-3xl prose-h1:mt-8 prose-h1:mb-4",
        "prose-h2:text-2xl prose-h2:mt-6 prose-h2:mb-3",
        "prose-h3:text-xl prose-h3:mt-4 prose-h3:mb-2",
        
        // 段落和列表样式
        "prose-p:my-4",
        "prose-ul:my-4 prose-ul:pl-6 prose-ul:list-disc",
        "prose-ol:my-4 prose-ol:pl-6 prose-ol:list-decimal",
        
        // 代码块样式
        "prose-pre:bg-muted/50 prose-pre:border prose-pre:p-4 prose-pre:rounded-lg",
        "prose-pre:overflow-x-auto prose-pre:scrollbar-thin prose-pre:scrollbar-thumb-border",
        "prose-pre:scrollbar-track-muted hover:prose-pre:scrollbar-thumb-primary/50",
        
        // 行内代码样式
        "prose-code:bg-muted/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm",
        "prose-pre:prose-code:p-0 prose-pre:prose-code:bg-transparent",
        
        // 图片样式
        "prose-img:rounded-lg prose-img:max-h-[600px] prose-img:mx-auto",
        "prose-img:transition-opacity prose-img:duration-200",
        
        // 表格样式
        "prose-table:w-full prose-table:my-4",
        "prose-th:border prose-th:p-2 prose-th:bg-muted/50",
        "prose-td:border prose-td:p-2",
        
        // 引用样式
        "prose-blockquote:border-l-4 prose-blockquote:border-primary",
        "prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:my-4",
        "prose-blockquote:text-muted-foreground",
        
        // 链接样式
        "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
        
        // 用户提及链接样式
        "[&_.mention]:text-primary [&_.mention]:font-medium",
        "[&_.mention]:bg-primary/10 [&_.mention]:px-1.5 [&_.mention]:py-0.5",
        "[&_.mention]:rounded hover:[&_.mention]:bg-primary/20",
        
        // 分割线样式
        "prose-hr:my-8 prose-hr:border-t prose-hr:border-border",
        
        // 自定义类名
        className
      )}
      dangerouslySetInnerHTML={{ __html: post.content }}
    />
  );
}
