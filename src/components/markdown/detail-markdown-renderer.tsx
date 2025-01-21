"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { UserLink } from "./user-link";

interface DetailMarkdownRendererProps {
  content: string;
  className?: string;
}

export function DetailMarkdownRenderer({ content, className }: DetailMarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        a: ({ href, children }) => {
          if (href?.startsWith("user://")) {
            const hashid = href.replace("user://", "");
            return <UserLink href={`/users/${hashid}`}>{children}</UserLink>;
          }
          if (href?.startsWith("/users/")) {
            const username = href.replace("/users/", "");
            return <UserLink href={`@${username}`}>{children}</UserLink>;
          }
          return <UserLink href={href || ""}>{children}</UserLink>;
        },
        code: ({
          inline,
          className,
          children,
          ...props
        }: {
          inline?: boolean;
          className?: string;
          children?: React.ReactNode;
        } & React.HTMLAttributes<HTMLElement>) => {
          if (inline) {
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
          return (
            <pre>
              <code className={className} {...props}>
                {children}
              </code>
            </pre>
          );
        },
      }}
      className={`break-words whitespace-pre-line ${className || ""}`}
    >
      {content}
    </ReactMarkdown>
  );
}
