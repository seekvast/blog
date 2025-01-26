"use client";

import * as React from "react";
import { useMarkdownEditor } from "@/store/md-editor";
import { Toolbar } from "./Toolbar";
import { Preview } from "./Preview";
import { FileUploader } from "./FileUploader";
import { cn } from "@/lib/utils";

interface EditorProps {
  className?: string;
  placeholder?: string;
}

export function Editor({ className, placeholder }: EditorProps) {
  const {
    content,
    setContent,
    selection,
    setSelection,
    previewMode,
    hasUnsavedContent,
  } = useMarkdownEditor();

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleSelect = React.useCallback(() => {
    if (!textareaRef.current) return;

    setSelection({
      start: textareaRef.current.selectionStart,
      end: textareaRef.current.selectionEnd,
    });
  }, [setSelection]);

  const handleInput = React.useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setContent(e.target.value);
    },
    [setContent]
  );

  // 处理快捷键
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = textareaRef.current?.selectionStart ?? 0;
      const end = textareaRef.current?.selectionEnd ?? 0;

      if (start === end) {
        const newContent = content.slice(0, start) + "  " + content.slice(end);

        setContent(newContent);

        // 移动光标到缩进后的位置
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart =
              textareaRef.current.selectionEnd = start + 2;
          }
        }, 0);
      }
    }
  };

  // 保持选择范围同步
  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.selectionStart = selection.start;
    textarea.selectionEnd = selection.end;
  }, [selection]);

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="border rounded-md focus-within:ring-2 focus-within:ring-primary">
        <Toolbar className="border-b rounded-t-md" />

        <div className="relative">
          {!previewMode && (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleInput}
              onSelect={handleSelect}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={cn(
                "w-full min-h-[200px] p-3",
                "focus:outline-none",
                "resize-y bg-background",
                hasUnsavedContent && "border-yellow-500"
              )}
            />
          )}

          {previewMode && (
            <div className="min-h-[200px]">
              <Preview content={content} />
            </div>
          )}
        </div>
      </div>

      <FileUploader className="mt-2" />
    </div>
  );
}
