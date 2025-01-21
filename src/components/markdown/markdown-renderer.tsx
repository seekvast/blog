"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { UserLink } from "./user-link";

interface MarkdownRendererProps {
  content: string;
  className?: string;
  skipMedia?: boolean;
}

export function MarkdownRenderer({ content, className, skipMedia = false }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      skipHtml={false}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[
        rehypeRaw,
        [
          rehypeSanitize,
          {
            attributes: {
              "*": ["className", "style", "class"],
              a: ["href", "title", "target", "rel", "className", "class"],
            },
            protocols: {
              href: ["http", "https", "mailto", "tel", "user", "/"],
            },
            tagNames: [
              "div", "p", "a", "span", "text",
              "h1", "h2", "h3", "h4", "h5", "h6"
            ],
          },
        ],
      ]}
      className={` ${className || ''}`}
      components={{
        img: skipMedia ? () => null : undefined,
        iframe: skipMedia ? () => null : undefined,
        a: ({ href, children }) => {
          if (skipMedia && (href?.includes("youtube.com") || href?.includes("youtu.be"))) {
            return null;
          }
          if (href?.startsWith("user://")) {
            const hashid = href.replace("user://", "");
            return <UserLink href={`/users/${hashid}`}>{children}</UserLink>;
          }
          if (href?.startsWith("/users/")) {
            const username = href.replace("/users/", "");
            return <UserLink href={`@${username}`}>{children}</UserLink>;
          }
          if (href?.startsWith("@")) {
            const username = href.replace("@", "");
            return <UserLink href={`@${username}`}>{children}</UserLink>;
          }
          return <UserLink href={href || ""}>{children}</UserLink>;
        },
        text: ({ children }) => {
          if (typeof children === 'string') {
            const parts = children.split(/(@[a-zA-Z0-9_-]+)/g);
            if (parts.length > 1) {
              return (
                <>
                  {parts.map((part, i) => {
                    if (part.startsWith('@')) {
                      const username = part.slice(1);
                      return <UserLink key={i} href={`@${username}`}>{part}</UserLink>;
                    }
                    return part;
                  })}
                </>
              );
            }
          }
          return <>{children}</>;
        },
        p: ({ children }) => {
          const hasContent = React.Children.toArray(children).some(
            (child) => typeof child === "string" && child.trim() !== ""
          );
          return hasContent ? <p className="!m-0">{children}</p> : null;
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
    >
      {content}
    </ReactMarkdown>
  );
}
