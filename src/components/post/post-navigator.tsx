"use client";

import * as React from "react";
import { ChevronsUp, ChevronsDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

interface PostNavigatorProps {
  totalPosts: number;
  discussionDate: string;
  hasUnreadPosts?: boolean;
  className?: string;
  onScrollToBottom?: () => void;
}

export function PostNavigator({
  totalPosts,
  discussionDate,
  hasUnreadPosts = false,
  className,
  onScrollToBottom,
}: PostNavigatorProps) {
  const [currentPostIndex, setCurrentPostIndex] = React.useState(1);
  const [isDragging, setIsDragging] = React.useState(false);
  const [scrollPosition, setScrollPosition] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLDivElement>(null);

  const formattedDate = format(new Date(discussionDate || ""), "MMMM yyyy", {
    locale: zhCN,
  });

  const scrollerHeight = 50; // 固定滑块高度

  const getTopPaddingHeight = () => {
    if (!scrollAreaRef.current) return 0;
    const scrollAreaHeight = scrollAreaRef.current.clientHeight;
    return scrollPosition * (scrollAreaHeight - scrollerHeight);
  };

  const getBottomPaddingHeight = () => {
    if (!scrollAreaRef.current) return 0;
    const scrollAreaHeight = scrollAreaRef.current.clientHeight;
    return (1 - scrollPosition) * (scrollAreaHeight - scrollerHeight);
  };

  // 滚动到顶部（主贴）
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 滚动到底部（最新评论）
  const scrollToBottom = () => {
    if (onScrollToBottom) {
      onScrollToBottom();
    } else {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  // 处理滑块区域点击
  const handleScrollAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollAreaRef.current) return;

    const rect = scrollAreaRef.current.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const scrollAreaHeight = rect.height;

    let newScrollPosition = offsetY / scrollAreaHeight;

    newScrollPosition = Math.max(0, Math.min(1, newScrollPosition));

    setScrollPosition(newScrollPosition);

    const postIndex = Math.max(
      1,
      Math.min(totalPosts, Math.round(newScrollPosition * (totalPosts - 1) + 1))
    );
    setCurrentPostIndex(postIndex);

    const scrollHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const pageScrollPosition = newScrollPosition * scrollHeight;

    window.scrollTo({
      top: pageScrollPosition,
      behavior: "smooth",
    });
  };

  // 处理拖动开始
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    e.preventDefault();
  };

  // 处理拖动
  const handleDrag = (clientY: number) => {
    if (!isDragging || !scrollAreaRef.current) return;

    const rect = scrollAreaRef.current.getBoundingClientRect();
    const offsetY = clientY - rect.top;
    const scrollAreaHeight = rect.height;

    let newScrollPosition = offsetY / scrollAreaHeight;

    newScrollPosition = Math.max(0, Math.min(1, newScrollPosition));

    setScrollPosition(newScrollPosition);

    const postIndex = Math.max(
      1,
      Math.min(totalPosts, Math.round(newScrollPosition * (totalPosts - 1) + 1))
    );
    setCurrentPostIndex(postIndex);

    const scrollHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const pageScrollPosition = newScrollPosition * scrollHeight;

    window.scrollTo({
      top: pageScrollPosition,
    });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // 监听滚动事件
  React.useEffect(() => {
    const handleScroll = () => {
      if (isDragging) return;

      const scrollTop = window.scrollY;
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const newScrollPosition = Math.max(
        0,
        Math.min(1, scrollTop / scrollHeight)
      );

      setScrollPosition(newScrollPosition);

      // 计算当前帖子索引
      const currentIndex = Math.max(
        1,
        Math.min(
          totalPosts,
          Math.round(newScrollPosition * (totalPosts - 1) + 1)
        )
      );
      setCurrentPostIndex(currentIndex);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDragging, totalPosts]);

  // 监听鼠标和触摸事件
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      handleDrag(e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleDrag(e.touches[0].clientY);
      }
    };

    const handleMouseUp = () => {
      handleDragEnd();
    };

    const handleTouchEnd = () => {
      handleDragEnd();
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging]);

  return (
    <div ref={containerRef} className={cn("flex items-center", className)}>
      <div className="flex flex-col items-start mr-4">
        <button
          onClick={scrollToTop}
          className="flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronsUp className="h-5 w-5 mr-1" />
          <span>最早内容</span>
        </button>

        {/* 滑块区域 */}
        <div
          ref={scrollAreaRef}
          onClick={handleScrollAreaClick}
          className="relative ml-2 cursor-ns-resize select-none touch-none"
          style={{ height: "220px", width: "4px" }}
        >
          <div className="absolute inset-0 bg-gray-200 rounded-sm hover:bg-gray-300 transition-colors" />

          <div className="relative h-full w-full">
            <div
              style={{ height: `${getTopPaddingHeight()}px` }}
              className="timeline-padding"
            />

            <div
              ref={scrollerRef}
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStart}
              style={{
                width: "8px",
                height: `${scrollerHeight}px`,
                left: "-2px",
              }}
              className="flex items-center z-10 bg-primary rounded-sm hover:bg-blue-600 transition-colors absolute"
            >
              <div style={{ height: "100%" }} />

              <div className="flex flex-col justify-center ml-4">
                <div className="text-base font-medium text-gray-800 whitespace-nowrap">
                  {currentPostIndex} / {totalPosts} 楼
                </div>
                <div className="text-sm text-gray-500 mt-1 whitespace-nowrap">
                  {formattedDate}
                </div>
              </div>
            </div>

            <div
              style={{ height: `${getBottomPaddingHeight()}px` }}
              className="timeline-padding"
            />
          </div>
        </div>

        <button
          onClick={scrollToBottom}
          className="flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronsDown className="h-5 w-5 mr-1" />
          <span>最新回覆</span>
        </button>
      </div>
    </div>
  );
}
