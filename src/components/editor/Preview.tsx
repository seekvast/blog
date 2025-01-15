import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { cn } from '@/lib/utils';

interface PreviewProps {
  content: string;
  className?: string;
}

export function Preview({ content, className }: PreviewProps) {
  return (
    <div 
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none",
        "min-h-[200px] p-3 rounded-md border bg-muted",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
          // 自定义组件渲染
          img: ({ node, ...props }) => (
            <img className="rounded-md max-h-96" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a className="text-primary hover:underline" {...props} />
          ),
          code: ({ node, inline, ...props }) => (
            inline ? (
              <code className="bg-muted px-1 py-0.5 rounded" {...props} />
            ) : (
              <code className="block bg-muted p-2 rounded" {...props} />
            )
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
