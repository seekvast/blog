"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Portal } from "@radix-ui/react-portal";
import { useDebounce } from "@/hooks/use-debounce";
import { useMentionable } from "@/hooks/use-mentionable";
import { createUserMention } from "@/lib/mentions/user-mention";
import { useClickAway } from "@/hooks/use-click-away";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { User } from "@/types/common";

interface MentionPickerProps {
  position: { top: number; left: number };
  query: string;
  onClose: () => void;
  onSelect: (text: string) => void;
}

const SEARCH_DELAY = 300;

export function MentionPicker({
  position,
  query,
  onClose,
  onSelect,
}: MentionPickerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState(query.slice(1));
  const [selectedIndex, setSelectedIndex] = useState(0);
  const debouncedSearch = useDebounce(search, SEARCH_DELAY);

  const mentionable = useMemo(() => createUserMention(), []);
  const { items, isLoading, error } = useMentionable(
    mentionable,
    debouncedSearch,
    {
      enabled: true,
      onError: console.error,
    }
  );

  useClickAway(ref, onClose);

  const handleSelect = useCallback(
    (user: User) => {
      onSelect(mentionable.format(user));
      onClose();
    },
    [mentionable, onSelect, onClose]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (items[selectedIndex]) {
            handleSelect(items[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    },
    [items, selectedIndex, handleSelect, onClose]
  );

  return (
    <Portal>
      <div
        ref={ref}
        className="fixed z-50"
        style={{
          top: position.top + 24,
          left: position.left
        }}
      >
        <Command className="w-64 border shadow-md rounded-lg">
          <CommandInput
            placeholder="搜索用户..."
            value={search}
            onValueChange={setSearch}
          />

          {error ? (
            <CommandEmpty>加载失败,请重试</CommandEmpty>
          ) : isLoading ? (
            <CommandEmpty>加载中...</CommandEmpty>
          ) : items.length === 0 ? (
            <CommandEmpty>未找到用户</CommandEmpty>
          ) : (
            <CommandGroup heading="用户">
              {items.map((user, index) => (
                <CommandItem
                  key={user.id}
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
                    <span className="text-sm font-medium">{user.username}</span>
                    {user.nickname && (
                      <span className="text-xs text-muted-foreground">
                        {user.nickname}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </Command>
      </div>
    </Portal>
  );
}
