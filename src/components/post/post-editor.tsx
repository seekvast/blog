"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Icon } from "@/components/icons";
import { UserLink } from "@/components/markdown/user-link";
import { EditorToolbar } from "./editor-toolbar";
import { MentionPopover } from "./mention-popover";
import { ReplyReference } from "./reply-reference";
import { useContentProcessor } from "@/hooks/use-content-processor";
import { useMention } from "@/hooks/use-mention";

interface User {
  hashid: string;
  username: string;
  nickname: string;
  avatar_url: string;
}

interface Comment {
  user: User;
  content: string;
}

interface PostEditorProps {
  content: string;
  onChange: (content: string) => void;
  onImageUpload?: (file: File) => Promise<void>;
  className?: string;
  previewMode?: boolean;
  onPreviewModeChange?: (mode: boolean) => void;
  imageUploading?: boolean;
  replyTo?: Comment;
  onReplyToChange?: (comment: Comment | null) => void;
  onSubmit?: (content: string) => Promise<void>;
}

export function PostEditor({
  content,
  onChange,
  onImageUpload,
  previewMode = false,
  onPreviewModeChange,
  imageUploading = false,
  className,
  replyTo,
  onReplyToChange,
  onSubmit,
}: PostEditorProps) {
  const [splitView, setSplitView] = React.useState(false);
  const processUrlDebounceRef = React.useRef<NodeJS.Timeout>();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { processContent } = useContentProcessor();
  const {
    showUserList,
    users,
    mentionPosition,
    textAreaRef,
    handleMention,
    selectUser,
    isSearching,
    closeMention,
  } = useMention(onChange);

  // 处理输入
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const currentPosition = e.target.selectionStart || 0;
    onChange(value);

    // 清除之前的定时器
    if (processUrlDebounceRef.current) {
      clearTimeout(processUrlDebounceRef.current);
    }

    // 处理@提及
    const isMentioning = handleMention(value, currentPosition);
    if (isMentioning) return;

    // 处理特殊内容（链接、YouTube等）
    if (
      value[currentPosition - 1] === " " ||
      value[currentPosition - 1] === "\n"
    ) {
      processUrlDebounceRef.current = setTimeout(() => {
        const processedText = processContent(value, currentPosition);
        if (processedText !== value) {
          onChange(processedText);
        }
      }, 100);
    }
  };

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      onImageUpload(file);
      // 清空文件选择器，这样同一个文件可以再次选择
      e.target.value = '';
    }
  };

  // handleToolbarAction 函数
  const handleToolbarAction = (action: string) => {
    if (!textAreaRef.current) return;

    const textarea = textAreaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    let newText = "";

    switch (action) {
      case "h1":
        newText = `# ${selectedText || "标题"}`;
        break;
      case "h2":
        newText = `## ${selectedText || "标题"}`;
        break;
      case "h3":
        newText = `### ${selectedText || "标题"}`;
        break;
      case "bold":
        newText = `**${selectedText || "粗体文字"}**`;
        break;
      case "italic":
        newText = `*${selectedText || "斜体文字"}*`;
        break;
      case "list-ul":
        newText = `- ${selectedText || "列表项"}`;
        break;
      case "list-ol":
        newText = `1. ${selectedText || "列表项"}`;
        break;
      case "quote":
        newText = `> ${selectedText || "引用文字"}`;
        break;
      case "link":
        newText = `[${selectedText || "链接文字"}](链接地址)`;
        break;
      case "image":
        if (onImageUpload) {
          fileInputRef.current?.click();
          return;
        }
        newText = `![${selectedText || "图片描述"}](图片地址)`;
        break;
      case "code":
        newText = selectedText.includes("\n")
          ? "```\n" + (selectedText || "代码块") + "\n```"
          : "`" + (selectedText || "代码") + "`";
        break;
      default:
        return;
    }

    const newContent = text.substring(0, start) + newText + text.substring(end);
    onChange(newContent);

    // 设置新的光标位置
    requestAnimationFrame(() => {
      textarea.focus();
      const newPosition = start + newText.length;
      textarea.setSelectionRange(newPosition, newPosition);
    });
  };

  return (
    <div className={cn("rounded-lg border bg-background flex flex-col relative", className)}>
      {imageUploading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <Icon name="refresh" className="text-2xl text-primary animate-spin" />
            <span className="text-sm text-gray-500">正在上传图片...</span>
          </div>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      {replyTo && (
        <ReplyReference
          comment={replyTo}
          onClose={() => {
            if (onReplyToChange) {
              onReplyToChange(null);
            }
          }}
        />
      )}
      <EditorToolbar
        onAction={handleToolbarAction}
        onImageUpload={onImageUpload}
        imageUploading={imageUploading}
        onPreviewToggle={() => onPreviewModeChange?.(!previewMode)}
        previewMode={previewMode}
        splitView={splitView}
        onSplitViewToggle={() => setSplitView(!splitView)}
      />

      <div className={cn("relative flex-1 flex min-h-[200px]", splitView && "divide-x")}>
        <textarea
          ref={textAreaRef}
          value={content}
          onChange={handleInput}
          className={cn(
            "w-full resize-none border-0 bg-transparent p-3 text-sm outline-none min-h-full",
            splitView && "flex-1"
          )}
          placeholder="写点什么..."
        />

        {(previewMode || splitView) && (
          <div
            className={cn(
              "prose prose-sm max-w-none p-3 dark:prose-invert whitespace-pre-line min-h-full",
              splitView ? "flex-1" : "absolute inset-0 bg-background"
            )}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                a: ({ node, ...props }) => {
                  const href = props.href || "";
                  if (href.startsWith("user://")) {
                    const username = Array.isArray(props.children) && props.children[0]
                      ? props.children[0].toString().replace("@", "")
                      : "";
                    return <UserLink href={`/users/${href.replace("user://", "")}`}>{`@${username}`}</UserLink>;
                  }
                  return (
                    <a {...props} target="_blank" rel="noopener noreferrer" />
                  );
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
          </div>
        )}
      </div>

      {showUserList && (
        <MentionPopover
          show={showUserList}
          position={mentionPosition}
          users={users}
          onSelect={selectUser}
          isSearching={isSearching}
          onClose={closeMention}
        />
      )}
    </div>
  );
}
