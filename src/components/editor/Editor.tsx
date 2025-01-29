"use client";

import * as React from "react";
import { useMarkdownEditor } from "@/store/md-editor";
import { Toolbar } from "./Toolbar";
import { Preview } from "./Preview";
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
      const value = e.target.value;
      
      // 检测URL并转换为Markdown链接
      const urlRegex = /(?:^|\s)(https?:\/\/[^\s]+)(?=\s|$)/g;
      const youtubeRegex = /https?:\/\/(?:www\.)?youtube\.com\/watch\?v=[^&\s]+/;
      let newContent = value;
      let match;
      
      // 使用while循环处理所有匹配项
      while ((match = urlRegex.exec(value)) !== null) {
        const url = match[1];
        // 检查URL是否已经是Markdown链接格式或YouTube链接
        const beforeUrl = value.slice(Math.max(0, match.index - 2), match.index);
        const afterUrl = value.slice(match.index + url.length, match.index + url.length + 2);
        const isAlreadyLink = beforeUrl === '](' || afterUrl.startsWith(')');
        const isYoutubeLink = url.match(youtubeRegex);
        
        if (!isAlreadyLink && !isYoutubeLink) {
          // 替换URL为Markdown链接
          const markdownLink = `[${url}](${url})`;
          newContent = newContent.slice(0, match.index) + 
                      match[0].replace(url, markdownLink) + 
                      newContent.slice(match.index + match[0].length);
          
          // 更新正则表达式的lastIndex以考虑新插入的文本长度
          const diff = markdownLink.length - url.length;
          urlRegex.lastIndex += diff;
        }
      }
      
      setContent(newContent);

      // 检查@提及
      const lastChar = value[e.target.selectionStart - 1];
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

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) handleImageUpload(file);
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
        <Toolbar className="border-b rounded-t-md" textareaRef={textareaRef} />

        <div className="relative">
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
    </div>
  );
}
