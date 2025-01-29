"use client";

import * as React from "react";
import { useMarkdownEditor } from "@/store/md-editor";
import { Toolbar } from "./Toolbar";
import { Preview } from "./Preview";
import { FileUploader } from "./FileUploader";
import { MentionPicker } from "./MentionPicker";
import { cn } from "@/lib/utils";
import { getCaretCoordinates } from "@/lib/utils/caret";

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
    addMention,
  } = useMarkdownEditor();

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [showMentionPicker, setShowMentionPicker] = React.useState(false);
  const [mentionQuery, setMentionQuery] = React.useState("");
  const [mentionPosition, setMentionPosition] = React.useState({
    top: 0,
    left: 0,
  });

  const handleSelect = React.useCallback(() => {
    if (!textareaRef.current) return;

    setSelection({
      start: textareaRef.current.selectionStart,
      end: textareaRef.current.selectionEnd,
    });
  }, [setSelection]);

  const handleInput = React.useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = e.target.value;
      setContent(newContent);

      // 检查是否输入了 @ 符号
      const lastChar = newContent[e.target.selectionStart - 1];
      if (lastChar === "@") {
        const rect = e.target.getBoundingClientRect();
        const position = getCaretCoordinates(e.target, e.target.selectionStart);

        setMentionPosition({
          top: rect.top + position.top,
          left: rect.left + position.left,
        });
        setMentionQuery("@");
        setShowMentionPicker(true);
      }
    },
    [setContent]
  );

  // 处理键盘事件，包括 @ 提及的处理
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = textareaRef.current?.selectionStart ?? 0;
      const end = textareaRef.current?.selectionEnd ?? 0;

      if (start === end) {
        const newContent = content.slice(0, start) + "  " + content.slice(end);
        setContent(newContent);
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
            <>
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
              {showMentionPicker && (
                <MentionPicker
                  position={mentionPosition}
                  query={mentionQuery}
                  onClose={() => setShowMentionPicker(false)}
                />
              )}
            </>
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
