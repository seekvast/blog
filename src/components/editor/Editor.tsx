"use client";

import * as React from "react";
import { Toolbar } from "./toolbar";
import { Preview } from "./preview";
import { MentionPicker } from "./mention-picker";
import { cn } from "@/lib/utils";
import { getCaretCoordinates } from "@/lib/utils/caret";
import { uploadFile, AttachmentType } from "@/lib/utils/upload";
import { Attachment } from "@/types";
import { Loader2, Minimize2, Maximize2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EditorProps {
  className?: string;
  placeholder?: string;
  attachmentType: AttachmentType;
  initialContent?: string;
  onChange?: (content: string) => void;
  onSave?: () => void;
  onFullscreenChange?: (isFullscreen: boolean) => void;
  onAttachmentUpload?: (attachment: Attachment) => void;
  onPublish?: () => void;
  publishLoading?: boolean;
  publishText?: string;
  boardId?: number;
  discussionId?: number;
  headerInfo?: {
    icon?: React.ReactNode;
    title?: string;
    onMinimize?: () => void;
    onMaximize?: () => void;
    onClose?: () => void;
  };
}

export const Editor = React.forwardRef<
  {
    reset: () => void;
    isFullscreen: boolean;
  },
  EditorProps
>(function Editor(
  {
    className,
    placeholder,
    attachmentType,
    initialContent = "",
    onChange,
    onSave,
    onFullscreenChange,
    onAttachmentUpload,
    onPublish,
    publishLoading,
    publishText,
    boardId,
    discussionId,
    headerInfo,
  }: EditorProps,
  ref
) {
  const [content, setContent] = React.useState(initialContent);
  const [selection, setSelection] = React.useState<{
    start: number;
    end: number;
  }>({
    start: 0,
    end: 0,
  });
  const [previewMode, setPreviewMode] = React.useState(false);
  const [hasUnsavedContent, setHasUnsavedContent] = React.useState(false);
  const [uploadingFiles, setUploadingFiles] = React.useState<File[]>([]);
  const [showMentionPicker, setShowMentionPicker] = React.useState(false);
  const [mentionQuery, setMentionQuery] = React.useState("");
  const [mentionPosition, setMentionPosition] = React.useState({
    top: 0,
    left: 0,
  });
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  // 历史记录状态
  const [history, setHistory] = React.useState<{
    past: string[];
    future: string[];
    current: string;
  }>({
    past: [],
    future: [],
    current: initialContent,
  });

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useImperativeHandle(ref, () => ({
    reset: () => {
      setContent("");
      setHistory({
        past: [],
        future: [],
        current: "",
      });
      setHasUnsavedContent(false);
      onChange?.("");
    },
    get isFullscreen() {
      return isFullscreen;
    },
  }));

  // 监听 initialContent 的变化
  React.useEffect(() => {
    if (initialContent !== content) {
      setContent(initialContent);
      setHistory((prev) => ({
        ...prev,
        current: initialContent,
      }));
    }
  }, [initialContent]);

  const handleSelect = React.useCallback(() => {
    if (!textareaRef.current) return;

    setSelection({
      start: textareaRef.current.selectionStart,
      end: textareaRef.current.selectionEnd,
    });
  }, []);

  const handleContentChange = React.useCallback(
    (newContent: string) => {
      setContent(newContent);
      setHasUnsavedContent(true);
      onChange?.(newContent);

      // 更新历史记录
      setHistory((prev) => ({
        past: [...prev.past, prev.current],
        current: newContent,
        future: [],
      }));
    },
    [onChange]
  );

  const handleInput = React.useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;

      // 检测@提及
      const cursorPosition = e.target.selectionStart;
      const textBeforeCursor = value.slice(0, cursorPosition);
      const mentionMatch = textBeforeCursor.match(/@(?!["\w\s#]+")(\w*)$/);

      if (mentionMatch && mentionMatch[1]) {
        const query = mentionMatch[1];
        const atSignPosition = cursorPosition - query.length - 1;

        const rect = e.target.getBoundingClientRect();
        const position = getCaretCoordinates(e.target, atSignPosition);

        setMentionPosition({
          top: rect.top + position.top,
          left: rect.left + position.left,
        });

        setMentionQuery(query);
        setShowMentionPicker(true);
      } else {
        setShowMentionPicker(false);
      }

      // 检测URL并转换为Markdown链接
      const urlRegex = /(?:^|\s)(https?:\/\/[^\s]+)(?=\s|$)/g;
      const youtubeRegex =
        /https?:\/\/(?:www\.)?youtube\.com\/watch\?v=[^&\s]+/;
      let newContent = value;
      let match;

      while ((match = urlRegex.exec(value)) !== null) {
        const url = match[1];
        // 检查URL是否已经是Markdown链接格式或YouTube链接
        const beforeUrl = value.slice(
          Math.max(0, match.index - 2),
          match.index
        );
        const afterUrl = value.slice(
          match.index + url.length,
          match.index + url.length + 2
        );
        const isAlreadyLink = beforeUrl === "](" || afterUrl.startsWith(")");
        const isYoutubeLink = url.match(youtubeRegex);

        if (!isAlreadyLink && !isYoutubeLink) {
          // 替换URL为Markdown链接
          const markdownLink = `[${url}](${url})`;
          newContent =
            newContent.slice(0, match.index) +
            match[0].replace(url, markdownLink) +
            newContent.slice(match.index + match[0].length);

          // 更新正则表达式的lastIndex以考虑新插入的文本长度
          const diff = markdownLink.length - url.length;
          urlRegex.lastIndex += diff;
        }
      }

      handleContentChange(newContent);
    },
    [handleContentChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = textareaRef.current?.selectionStart ?? 0;
      const end = textareaRef.current?.selectionEnd ?? 0;

      if (start === end) {
        const newContent = content.slice(0, start) + "  " + content.slice(end);
        handleContentChange(newContent);
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart =
              textareaRef.current.selectionEnd = start + 2;
          }
        }, 0);
      }
    } else if (showMentionPicker && e.key === "Escape") {
      e.preventDefault();
      setShowMentionPicker(false);
    } else if (e.metaKey || e.ctrlKey) {
      if (e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;

    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) handleImageUpload(file);
      }
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploadingFiles((prev) => [...prev, file]);
      const image = await uploadFile(file, attachmentType);
      onAttachmentUpload?.(image);
      const imageMarkdown = `![${file.name}](${image.url})`;
      handleContentChange(content + imageMarkdown);
    } catch (error) {
      console.error("Failed to upload image:", error);
    } finally {
      setUploadingFiles((prev) => prev.filter((f) => f !== file));
    }
  };

  const undo = React.useCallback(() => {
    setHistory((prev) => {
      if (prev.past.length === 0) return prev;

      const newPast = prev.past.slice(0, -1);
      const newCurrent = prev.past[prev.past.length - 1];

      setContent(newCurrent);
      onChange?.(newCurrent);

      return {
        past: newPast,
        current: newCurrent,
        future: [prev.current, ...prev.future],
      };
    });
  }, [onChange]);

  const redo = React.useCallback(() => {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev;

      const newFuture = prev.future.slice(1);
      const newCurrent = prev.future[0];

      setContent(newCurrent);
      onChange?.(newCurrent);

      return {
        past: [...prev.past, prev.current],
        current: newCurrent,
        future: newFuture,
      };
    });
  }, [onChange]);

  const insertMention = React.useCallback(
    (content: string, user: { username: string }, cursorPosition: number) => {
      const before = content.slice(0, cursorPosition);
      const after = content.slice(cursorPosition);

      const lastAtPos = before.lastIndexOf("@");
      if (lastAtPos === -1) return content;

      const newContent =
        before.slice(0, lastAtPos) +
        `[@${user.username}](@${user.username})` +
        after;

      return newContent;
    },
    []
  );

  const toggleFullscreen = React.useCallback(() => {
    setIsFullscreen((prev) => {
      const newState = !prev;
      onFullscreenChange?.(newState);
      return newState;
    });
  }, [onFullscreenChange]);

  // 保持选择范围同步
  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.selectionStart = selection.start;
    textarea.selectionEnd = selection.end;
  }, [selection]);

  // 监听快捷键
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === "s") {
          e.preventDefault();
          onSave?.();
        }
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [onSave]);

  return (
    <div
      className={cn(
        "relative flex w-full h-full min-h-0 flex-col overflow-hidden border rounded-md bg-background",
        isFullscreen &&
          "fixed inset-0 z-50 m-0 h-[calc(100vh-56px)] w-screen h-full rounded-none",
        !isFullscreen && "kater-focus-primary",
        className
      )}
    >
      {/* 头部信息 - 只在非全屏模式下显示 */}
      {headerInfo && (
        <div className="flex items-center justify-between p-2 bg-background">
          <div className="flex items-center space-x-2">
            {headerInfo.icon}
            <span className="text-sm text-muted-foreground truncate max-w-[200px]">
              {headerInfo.title}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            {headerInfo.onMaximize && !isFullscreen && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => toggleFullscreen()}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            )}
            {headerInfo.onClose && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  headerInfo.onClose?.();
                  toggleFullscreen();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      <div
        className={cn(
          "relative flex-grow flex min-h-0 overflow-hidden",
          isFullscreen && "h-[calc(100vh-calc(56px+3.5rem))]"
        )}
      >
        {!previewMode && (
          <>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleInput}
              onSelect={handleSelect}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder={placeholder}
              className={cn(
                "w-full px-3 pt-3 pb-3 outline-none border-none",
                "bg-background",
                "resize-none",
                "whitespace-pre-wrap",
                isFullscreen && "h-full"
              )}
            />
            {showMentionPicker && (
              <MentionPicker
                position={mentionPosition}
                query={mentionQuery}
                content={content}
                cursorPosition={textareaRef.current?.selectionStart ?? 0}
                onClose={() => setShowMentionPicker(false)}
                onSelect={(user) => {
                  const newContent = insertMention(
                    content,
                    user,
                    textareaRef.current?.selectionStart ?? 0
                  );
                  handleContentChange(newContent);
                  setShowMentionPicker(false);
                }}
                onMention={(newContent, newPosition) => {
                  handleContentChange(newContent);
                  requestAnimationFrame(() => {
                    if (!textareaRef.current) return;
                    textareaRef.current.focus();
                    textareaRef.current.setSelectionRange(
                      newPosition,
                      newPosition
                    );
                    setSelection({ start: newPosition, end: newPosition });
                  });
                }}
                context={{
                  boardId,
                  discussionId,
                }}
              />
            )}
          </>
        )}

        {previewMode && (
          <div className={cn("h-full")}>
            <Preview
              content={content}
              className={cn(isFullscreen && "h-full")}
            />
          </div>
        )}

        {/* 上传状态指示器 */}
        {uploadingFiles.length > 0 && (
          <div className="absolute bottom-4 right-4 flex flex-col gap-2 max-w-[250px]">
            {uploadingFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="bg-background/80 backdrop-blur-sm border rounded-md p-2 shadow-md flex items-center gap-2 text-sm"
              >
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <div className="flex-1 truncate">
                  <div className="font-medium truncate">{file.name}</div>
                  <div className="text-xs text-muted-foreground">
                    图片上传中...
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Toolbar
        className={cn(
          "border-t",
          isFullscreen && "sticky bottom-0 z-10 bg-background"
        )}
        textareaRef={textareaRef}
        onImageUpload={handleImageUpload}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        content={content}
        selection={selection}
        previewMode={previewMode}
        onContentChange={handleContentChange}
        onSelectionChange={setSelection}
        onPreviewModeChange={setPreviewMode}
        showPublishButton={!!onPublish}
        onPublish={onPublish}
        publishLoading={publishLoading}
        publishText={publishText || "Post Reply"}
      />
    </div>
  );
});
