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
        const imageMatch = line.match(
          /https?:\/\/[^\s<]+\.(?:jpg|jpeg|png|gif)(?:\?[^\s<]+)?/i
        );
        if (imageMatch) {
          return `![](${imageMatch[0]})`;
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
