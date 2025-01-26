import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useMarkdownEditor } from '@/store/md-editor';
import { useDebounce } from '@/hooks/use-debounce';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { userService } from '@/services/user';
import type { User } from '@/types/common';

interface MentionPickerProps {
  position: { top: number; left: number };
  query: string;
  onClose: () => void;
}

export function MentionPicker({ position, query, onClose }: MentionPickerProps) {
  const { insertText } = useMarkdownEditor();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(query.slice(1)); // 移除 @ 符号
  const debouncedSearch = useDebounce(search, 300);
  const commandRef = useRef<HTMLDivElement>(null);

  // 获取用户建议
  const fetchUsers = useCallback(async (searchTerm: string) => {
    if (!searchTerm) return;
    setLoading(true);
    try {
      const { data } = await userService.getUsers({
        search: searchTerm,
        limit: 5,
      });
      setUsers(data.items);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 监听搜索词变化
  useEffect(() => {
    fetchUsers(debouncedSearch);
  }, [debouncedSearch, fetchUsers]);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (commandRef.current && !commandRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // 处理选择用户
  const handleSelect = (user: User) => {
    // 计算需要替换的 @ 符号位置
    const mentionText = `@${user.username} `;
    insertText(mentionText);
    onClose();
  };

  return (
    <div
      ref={commandRef}
      className="absolute z-50"
      style={{
        top: position.top + 24, // 调整位置以避免遮挡输入
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
            <div className="p-2 text-sm text-muted-foreground">
              加载中...
            </div>
          ) : (
            users.map((user) => (
              <CommandItem
                key={user.id}
                onSelect={() => handleSelect(user)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>
                    {user.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{user.username}</span>
                  {user.nickname && (
                    <span className="text-xs text-muted-foreground">
                      {user.nickname}
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
