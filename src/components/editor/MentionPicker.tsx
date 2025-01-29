import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useMarkdownEditor } from "@/store/md-editor";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { userService } from "@/services/user";
import type { User } from "@/types/common";
import { api } from "@/lib/api";
import { useMentionable } from "@/hooks/use-mentionable";
import { createUserMention } from "@/lib/mentions/user-mention";

interface MentionPickerProps {
  position: { top: number; left: number };
  query: string;
  onClose: () => void;
}

const SEARCH_THROTTLE = 250;
const MAX_RESULTS = 5;

export function MentionPicker({
  position,
  query,
  onClose,
}: MentionPickerProps) {
  const { insertText } = useMarkdownEditor();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(query.slice(1)); // 移除 @ 符号
  const debouncedSearch = useDebounce(search, SEARCH_THROTTLE);
  const commandRef = useRef<HTMLDivElement>(null);
  const [initialUsers, setInitialUsers] = useState<User[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const mentionable = useMemo(() => createUserMention(), []);
  const { items, isLoading } = useMentionable(mentionable, query);

  // 获取初始用户列表
  useEffect(() => {
    const loadInitialUsers = async () => {
      try {
        const { items } = await api.users.list({
          limit: MAX_RESULTS,
        });
        setInitialUsers(items);
      } catch (error) {
        console.error("Error fetching initial users:", error);
      }
    };
    loadInitialUsers();
  }, []);

  // 获取用户建议
  const fetchUsers = useCallback(
    async (searchTerm: string) => {
      if (!searchTerm) {
        setUsers(initialUsers);
        return;
      }
      setLoading(true);
      try {
        const { items } = await api.users.list({
          search: searchTerm,
          limit: MAX_RESULTS,
        });
        setUsers(items);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    },
    [initialUsers]
  );

  // 监听搜索词变化
  useEffect(() => {
    fetchUsers(debouncedSearch);
  }, [debouncedSearch, fetchUsers]);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        commandRef.current &&
        !commandRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // 处理选择用户
  const handleSelect = useCallback(
    (item: User) => {
      insertText(mentionable.format(item));
      onClose();
    },
    [mentionable, insertText, onClose]
  );

  // 高亮匹配的文本
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;

    const parts = text.toLowerCase().split(query.toLowerCase());
    if (parts.length === 1) return text;

    const result = [];
    let lastIndex = 0;

    parts.forEach((part, index) => {
      // 添加非匹配部分
      const startIndex = lastIndex;
      const endIndex = startIndex + part.length;
      if (part) {
        result.push(
          <span key={`text-${index}`}>{text.slice(startIndex, endIndex)}</span>
        );
      }

      // 添加匹配部分
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

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, users.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 0, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (users[selectedIndex]) {
          handleSelect(users[selectedIndex]);
        }
      }
    },
    [users, selectedIndex, handleSelect]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      ref={commandRef}
      className="absolute z-50"
      style={{
        top: position.top + 24,
        left: position.left,
      }}
    >
      <Command className="w-64 border shadow-md rounded-lg">
        <CommandInput
          placeholder="搜索用户..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandEmpty>未找到用户</CommandEmpty>
        <CommandGroup heading="推荐用户">
          {loading ? (
            <div className="p-2 text-sm text-muted-foreground">加载中...</div>
          ) : (
            users.map((user, index) => (
              <CommandItem
                key={`user-${user.id}`}
                onSelect={() => handleSelect(user)}
                className={cn(
                  "flex items-center gap-2 cursor-pointer",
                  selectedIndex === index && "bg-primary/20"
                )}
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user.avatar} alt={user.username} />
                  <AvatarFallback>
                    {user.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {highlightMatch(user.username, search)}
                  </span>
                  {user.nickname && (
                    <span className="text-xs text-muted-foreground">
                      {highlightMatch(user.nickname, search)}
                    </span>
                  )}
                </div>
              </CommandItem>
            ))
          )}
        </CommandGroup>
      </Command>
    </div>
  );
}
