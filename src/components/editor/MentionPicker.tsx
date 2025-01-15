import React, { useState, useEffect, useRef } from 'react';
import { usePostEditorStore } from '@/store/post-editor';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  avatar?: string;
}

interface MentionPickerProps {
  position: { top: number; left: number };
  onClose: () => void;
}

export function MentionPicker({ position, onClose }: MentionPickerProps) {
  const { addMention } = usePostEditorStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const commandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 这里需要实现获取用户列表的逻辑
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users/suggest');
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        commandRef.current && 
        !commandRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleSelect = (user: User) => {
    addMention(user.name);
    onClose();
  };

  return (
    <div
      ref={commandRef}
      className="absolute z-50"
      style={{
        top: position.top + 20,
        left: position.left,
      }}
    >
      <Command className="w-64 border shadow-md">
        <CommandInput placeholder="搜索用户..." />
        <CommandEmpty>未找到用户</CommandEmpty>
        <CommandGroup>
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
                    {user.name[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>{user.name}</span>
              </CommandItem>
            ))
          )}
        </CommandGroup>
      </Command>
    </div>
  );
}
