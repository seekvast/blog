"use client";

import * as React from "react";

export function useMentionProcessor() {
  const processMention = React.useCallback((text: string, cursorPos: number) => {
    // 获取光标所在行的内容
    const lines = text.split("\n");
    let currentPos = 0;
    let currentLine = -1;

    // 找到光标所在的行
    for (let i = 0; i < lines.length; i++) {
      const lineLength = lines[i].length + 1; // +1 for newline
      if (currentPos + lineLength >= cursorPos) {
        currentLine = i;
        break;
      }
      currentPos += lineLength;
    }

    // 如果没找到光标所在行，返回原文本
    if (currentLine === -1) return text;

    // 只处理光标所在行的最后一个@提及
    const line = lines[currentLine];
    const lastAtPos = line.lastIndexOf("@");
    if (lastAtPos === -1) return text;

    // 检查@后面的文本是否已经被格式化
    const textAfterAt = line.slice(lastAtPos);
    if (textAfterAt.includes("[") || textAfterAt.includes("]")) return text;

    // 提取用户名（从@后面到空格或行尾）
    const match = textAfterAt.match(/^@([a-zA-Z0-9_-]+)(?=\s|$)/);
    if (!match) return text;

    // 替换这一行中的@提及
    const username = match[1];
    const newLine = line.replace(
      `@${username}`,
      `[@${username}](@${username})`
    );
    
    // 更新文本
    lines[currentLine] = newLine;
    return lines.join("\n");
  }, []);

  return {
    processMention,
  };
}
