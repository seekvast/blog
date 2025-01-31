"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Post } from "@/types";

interface PostContentProps {
  post: Post;   
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
        "min-h-[100px] w-full text-sm leading-7 text-foreground",
        
        // 基础文本样式
        "[&_p]:mb-4 [&_p]:last:mb-0",
        "[&_ul]:mb-4 [&_ul]:pl-6 [&_ul]:list-disc",
        "[&_ol]:mb-4 [&_ol]:pl-6 [&_ol]:list-decimal",
        
        // 标题样式
        "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-4",
        "[&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3",
        "[&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2",
        
        // 代码相关样式
        "[&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-[90%]",
        "[&_:not(pre)>code]:bg-muted/30 [&_:not(pre)>code]:px-2 [&_:not(pre)>code]:py-1",
        "[&_:not(pre)>code]:rounded [&_:not(pre)>code]:border [&_:not(pre)>code]:border-muted/20",
        
        "[&_pre]:bg-muted/30 [&_pre]:p-4 [&_pre]:rounded-md",
        "[&_pre]:border [&_pre]:border-muted/20",
        "[&_pre]:overflow-x-auto [&_pre]:text-[90%]",
        
        "[&_pre>code]:p-0 [&_pre>code]:bg-transparent",
        "[&_pre>code]:border-0 [&_pre>code]:block",
        "[&_pre>code]:max-h-[50vh] [&_pre>code]:min-h-[250px]",
        
        // 引用样式
        "[&_blockquote]:border-l-4 [&_blockquote]:border-primary/50",
        "[&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4",
        "[&_blockquote]:text-muted-foreground",
        
        // 链接样式
        "[&_a:not(.mention)]:text-primary [&_a:not(.mention)]:underline-offset-4",
        "[&_a:not(.mention)]:hover:underline",
        
        // 用户提及链接样式
        "[&_.mention]:text-primary [&_.mention]:font-medium",
        "[&_.mention]:bg-primary/10 [&_.mention]:px-1.5 [&_.mention]:py-0.5",
        "[&_.mention]:rounded [&_.mention]:hover:bg-primary/20",
        
        // 分割线样式
        "[&_hr]:my-8 [&_hr]:border-t [&_hr]:border-border",
        
        // 表格样式
        "[&_table]:w-full [&_table]:my-4 [&_table]:border-collapse",
        "[&_th]:border [&_th]:p-2 [&_th]:bg-muted/50",
        "[&_td]:border [&_td]:p-2",
        className
      )}
      dangerouslySetInnerHTML={{ __html: post.content }}
    />
  );
}
