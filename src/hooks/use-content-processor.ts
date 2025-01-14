"use client";

import * as React from "react";

export function useContentProcessor() {
  const processSpecialContent = React.useCallback(
    (text: string, cursorPos: number) => {
      const lines = text.split("\n");
      let currentPos = 0;
      const processedLines = lines.map((line) => {
        const lineLength = line.length + 1; // +1 for newline
        if (currentPos + lineLength < cursorPos) {
          currentPos += lineLength;
          return line;
        }

        // 处理 YouTube 链接
        const youtubeMatch = line.match(
          /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)(?:&\S*)?/
        );
        if (youtubeMatch) {
          return `\n<iframe width="560" height="315" src="https://www.youtube.com/embed/${youtubeMatch[1]}" frameborder="0" allowfullscreen></iframe>\n`;
        }

        // 处理图片链接
        const markdownImageMatch = line.match(/!\[.*?\]\(.*?\)/);
        if (markdownImageMatch) {
          return line; // 如果已经是 markdown 图片格式，直接返回
        }

        const imageMatch = line.match(
          /https?:\/\/[^\s<]+\.(?:jpg|jpeg|png|gif)(?:\?[^\s<]+)?/i
        );
        if (imageMatch && !line.includes("](")) {
          return `![](${imageMatch[0]})`;
        }

        // 处理用户提及
        const userMentionMatch = line.match(/@([a-zA-Z0-9_-]+)/g);
        if (userMentionMatch) {
          let processedLine = line;
          userMentionMatch.forEach(mention => {
            const username = mention.slice(1);
            processedLine = processedLine.replace(mention, `[@${username}](/users/${username})`);
          });
          return processedLine;
        }

        // 处理普通链接
        const urlMatch = line.match(/https?:\/\/[^\s<]+[^<.,:;"')\]\s]/);
        if (urlMatch && !line.includes("[") && !line.includes("]")) {
          return line.replace(urlMatch[0], `[${urlMatch[0]}](${urlMatch[0]})`);
        }

        currentPos += lineLength;
        return line;
      });

      return processedLines.join("\n");
    },
    []
  );

  return {
    processContent: processSpecialContent,
  };
}
