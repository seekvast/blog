"use client";

import * as React from "react";
import { http } from "@/lib/request";

interface User {
  hashid: string;
  username: string;
  nickname: string;
  avatar_url: string;
}

export function useMention(onChange: (content: string) => void) {
  const [showUserList, setShowUserList] = React.useState(false);
  const [userSearchQuery, setUserSearchQuery] = React.useState("");
  const [users, setUsers] = React.useState<User[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [cursorPosition, setCursorPosition] = React.useState({
    start: 0,
    end: 0,
  });
  const [mentionPosition, setMentionPosition] = React.useState({
    top: 0,
    left: 0,
  });
  const textAreaRef = React.useRef<HTMLTextAreaElement>(null);
  const userSearchDebounceRef = React.useRef<NodeJS.Timeout>();

  const searchUsers = React.useCallback(async (query: string) => {
    try {
      setIsSearching(true);
      const response = await http.get(
        `/api/users?keyword=${encodeURIComponent(query)}`
      );
      if (response.code === 0) {
        setUsers(response.data);
        setShowUserList(true);
      } else {
        console.error("Error searching users:", response.message);
        setUsers([]);
        setShowUserList(true);
      }
    } catch (error) {
      console.error("Error searching users:", error);
      setUsers([]);
      setShowUserList(true);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const calculateMentionPosition = React.useCallback((atPosition: number) => {
    if (!textAreaRef.current) return;

    const textarea = textAreaRef.current;
    const text = textarea.value;

    // 创建一个临时的 span 元素来计算文本宽度
    const span = document.createElement("span");
    const computedStyle = window.getComputedStyle(textarea);
    span.style.font = computedStyle.font;
    span.style.fontSize = computedStyle.fontSize;
    span.style.padding = computedStyle.padding;
    span.style.whiteSpace = "pre-wrap";
    span.style.position = "absolute";
    span.style.visibility = "hidden";
    document.body.appendChild(span);

    // 获取@符号之前的文本
    const textBeforeAt = text.substring(0, atPosition);
    const lines = textBeforeAt.split("\n");
    const currentLine = lines[lines.length - 1];

    // 计算@符号之前文本的宽度
    span.textContent = currentLine + "@";
    const textWidth = span.offsetWidth;

    // 清理临时元素
    document.body.removeChild(span);

    // 计算位置
    const textareaRect = textarea.getBoundingClientRect();
    const lineHeight = parseInt(computedStyle.lineHeight);
    const paddingTop = parseInt(computedStyle.paddingTop);
    const paddingLeft = parseInt(computedStyle.paddingLeft);

    // 计算垂直位置（考虑滚动）
    const top =
      textareaRect.top +
      paddingTop +
      lineHeight * (lines.length - 1) +
      lineHeight;

    // 计算水平位置
    const left = textareaRect.left + paddingLeft + textWidth;

    setMentionPosition({ top, left });
  }, []);

  const handleMention = React.useCallback(
    (text: string, currentPosition: number) => {
      if (userSearchDebounceRef.current) {
        clearTimeout(userSearchDebounceRef.current);
      }

      const lastAtPos = text.lastIndexOf("@", currentPosition);
      if (lastAtPos !== -1) {
        const textAfterAt = text.slice(lastAtPos + 1, currentPosition);
        if (!textAfterAt.includes(" ") && !textAfterAt.includes("\n")) {
          setCursorPosition({ start: currentPosition, end: currentPosition });
          setUserSearchQuery(textAfterAt);
          calculateMentionPosition(lastAtPos);
          
          // Only search if there are characters after @
          if (textAfterAt) {
            setShowUserList(false); // Hide list while searching
            userSearchDebounceRef.current = setTimeout(() => {
              searchUsers(textAfterAt);
            }, 300);
          } else {
            setShowUserList(false); // Hide list when only @ is typed
          }
          return true;
        }
      }

      setShowUserList(false);
      return false;
    },
    [calculateMentionPosition, searchUsers]
  );

  const selectUser = React.useCallback(
    (user: User) => {
      if (!textAreaRef.current) return;

      const textarea = textAreaRef.current;
      const text = textarea.value;
      const lastAtPos = text.lastIndexOf("@", cursorPosition.end);
      if (lastAtPos === -1) return;

      const newText =
        text.slice(0, lastAtPos) +
        `[@${user.username}](@${user.username})` +
        text.slice(cursorPosition.end);

      onChange(newText);
      setShowUserList(false);

      // 设置光标位置
      const newCursorPos =
        lastAtPos + `[@${user.username}](@${user.username})`.length;
      textarea.selectionStart = newCursorPos;
      textarea.selectionEnd = newCursorPos;
      textarea.focus();
    },
    [cursorPosition.end, onChange]
  );

  const closeMention = React.useCallback(() => {
    setShowUserList(false);
    setUsers([]);
    setUserSearchQuery("");
  }, []);

  return {
    showUserList,
    users,
    mentionPosition,
    textAreaRef,
    handleMention,
    selectUser,
    isSearching,
    closeMention,
  };
}
