"use client";

import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    const media = window.matchMedia(query);
    
    // 设置初始值
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    // 监听变化
    const listener = () => {
      setMatches(media.matches);
    };
    
    // 添加监听器
    media.addEventListener("change", listener);
    
    // 清理函数
    return () => {
      media.removeEventListener("change", listener);
    };
  }, [matches, query]);
  
  return matches;
}
