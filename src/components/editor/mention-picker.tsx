import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@/types";
import { api } from "@/lib/api";

interface MentionContext {
  boardId?: number;
  discussionId?: number;
}

interface MentionPickerProps {
  position: { top: number; left: number };
  query: string;
  onClose: () => void;
  onSelect: (user: { username: string; hashid: string }) => void;
  content: string;
  cursorPosition: number;
  onMention: (newContent: string, newPosition: number) => void;
  context?: MentionContext;
}

const SEARCH_THROTTLE = 250;
const MAX_RESULTS = 15;

export function MentionPicker({
  position,
  query,
  onClose,
  onSelect,
  content,
  cursorPosition,
  onMention,
  context,
}: MentionPickerProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, SEARCH_THROTTLE);

  // 获取用户建议
  const fetchUsers = useCallback(
    async (searchTerm: string) => {
      if (!searchTerm && searchTerm !== "") return;

      setLoading(true);
      try {
        // 构建查询参数
        const queryParams: Record<string, any> = {
          keyword: searchTerm,
          per_page: MAX_RESULTS,
        };

        // 添加上下文参数
        if (context?.boardId) {
          queryParams.board_id = context.boardId;
        }

        if (context?.discussionId) {
          queryParams.discussion_id = context.discussionId;
        }

        const { items } = await api.users.list(queryParams);
        setUsers(items);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    },
    [context]
  );

  // 监听搜索词变化
  useEffect(() => {
    fetchUsers(debouncedQuery);
  }, [debouncedQuery, fetchUsers]);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mouseup", handleClickOutside);
    return () => document.removeEventListener("mouseup", handleClickOutside);
  }, [onClose]);

  // 处理选择用户
  const handleSelect = useCallback(
    (user: User) => {
      const textBeforeCursor = content.slice(0, cursorPosition);
      const atIndex = textBeforeCursor.lastIndexOf("@");

      if (atIndex !== -1) {
        // 使用 Flarum 格式: @"username"#hashid
        const mentionText = `@"${user.username}"#${user.hashid}`;
        const newContent =
          content.slice(0, atIndex) +
          mentionText +
          content.slice(cursorPosition);

        // 计算新的光标位置（在提及文本之后）
        const newPosition = atIndex + mentionText.length;

        onMention(newContent, newPosition);
        onClose();
      }
    },
    [content, cursorPosition, onMention, onClose]
  );

  // 处理键盘导航
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % users.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + users.length) % users.length);
          break;
        case "Enter":
          e.preventDefault();
          if (users[selectedIndex]) {
            handleSelect(users[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    },
    [users, selectedIndex, handleSelect, onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // 高亮匹配文本
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;

    const parts = text.toLowerCase().split(query.toLowerCase());
    if (parts.length === 1) return text;

    const result: React.ReactNode[] = [];
    let lastIndex = 0;

    parts.forEach((part, index) => {
      const startIndex = lastIndex;
      const endIndex = startIndex + part.length;
      if (part) {
        result.push(
          <span key={`text-${index}`}>{text.slice(startIndex, endIndex)}</span>
        );
      }

      if (index !== parts.length - 1) {
        const matchStart = endIndex;
        const matchEnd = matchStart + query.length;
        result.push(
          <span key={`highlight-${index}`} className="bg-primary/20">
            {text.slice(matchStart, matchEnd)}
          </span>
        );
      }

      lastIndex = endIndex + query.length;
    });

    return <>{result}</>;
  };

  return (
    <div
      ref={containerRef}
      className="absolute z-50 w-64 border rounded-lg shadow-md bg-popover"
      style={{
        top: position.top + 24,
        left: position.left,
      }}
    >
      {loading ? (
        <div className="p-2 text-sm text-muted-foreground">搜索中...</div>
      ) : users.length === 0 ? (
        <div className="p-2 text-sm text-muted-foreground">未找到用户</div>
      ) : (
        <div className="py-1">
          {users.map((user, index) => (
            <button
              key={user.hashid}
              onClick={() => handleSelect(user)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`w-full px-3 py-2 flex items-center gap-2 text-left hover:bg-accent focus:bg-accent focus:outline-none ${
                selectedIndex === index ? "bg-accent" : ""
              }`}
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={user.avatar_url} alt={user.username} />
                <AvatarFallback>
                  {user.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium truncate">
                  {highlightMatch(user.username, query)}
                </span>
                {user.nickname && (
                  <span className="text-xs text-muted-foreground truncate">
                    {highlightMatch(user.nickname, query)}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
