import React from "react";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import ReactMarkdown, { Components } from "react-markdown";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

// 扩展基础 HTML 元素的 Props
type ImgProps = ComponentPropsWithoutRef<'img'> & { 
  node?: any;
  loading?: 'lazy' | 'eager';
};
type AnchorProps = ComponentPropsWithoutRef<'a'> & { node?: any };
type CodeProps = ComponentPropsWithoutRef<'code'> & {
  node?: any;
  inline?: boolean;
};

// 本地快速解析
export function parseLocalMarkdown(content: string): React.ReactElement {
  const components: Components = {
    img: ({ node, alt, ...props }: ImgProps) => (
      <img 
        className="rounded-md max-h-96" 
        alt={alt || ""}
        decoding="async"
        loading="lazy"
        {...props} 
      />
    ),
    a: ({ node, href, children, ...props }: AnchorProps) => (
      <a 
        className="text-primary hover:underline" 
        href={href}
        target={href?.startsWith('http') ? '_blank' : undefined}
        rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
        {...props} 
      >
        {children}
      </a>
    ),
    code: ({ node, inline, className, children, ...props }: CodeProps) => {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <pre className="overflow-auto">
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      ) : (
        <code 
          className={cn(
            "px-1.5 py-0.5 rounded text-sm font-mono",
            inline ? "bg-muted" : "block bg-muted p-3"
          )} 
          {...props}
        >
          {children}
        </code>
      );
    },
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeSanitize]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  );
}

// 服务端解析
export async function parseServerMarkdown(content: string): Promise<string> {
  try {
    const response = await fetch("/api/markdown/parse", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error('Failed to parse markdown');
    }

    const data = await response.json();
    return data.html;
  } catch (error) {
    console.error('Error parsing markdown:', error);
    throw error;
  }
}
