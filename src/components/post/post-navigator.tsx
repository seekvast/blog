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
  const [thumbPositionPercentage, setThumbPositionPercentage] =
    React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const sliderRef = React.useRef<HTMLDivElement>(null);
  const sliderThumbRef = React.useRef<HTMLDivElement>(null);

  // 格式化日期
  const formattedDate = format(new Date(discussionDate || ""), "MMMM yyyy", {
    locale: zhCN,
  });

  // 计算滑块高度百分比
  const thumbHeightPercentage = React.useMemo(() => {
    const minPercentage = 20;
    const maxPercentage = 80;
    const percentage = Math.max(
      minPercentage,
      maxPercentage - ((totalPosts - 1) / 49) * (maxPercentage - minPercentage)
    );
    return Math.min(percentage, maxPercentage);
  }, [totalPosts]);

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

  // 处理滑块点击
  const handleSliderClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const percentage = (offsetY / rect.height) * 100;

    // 限制百分比在有效范围内
    const limitedPercentage = Math.max(
      0,
      Math.min(100 - thumbHeightPercentage, percentage)
    );
    setThumbPositionPercentage(limitedPercentage);

    // 计算对应的帖子索引
    const postIndex = Math.max(
      1,
      Math.min(
        totalPosts,
        Math.round(
          (limitedPercentage / (100 - thumbHeightPercentage)) *
            (totalPosts - 1) +
            1
        )
      )
    );
    setCurrentPostIndex(postIndex);

    // 计算滚动位置
    const scrollHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const scrollPosition =
      (limitedPercentage / (100 - thumbHeightPercentage)) * scrollHeight;

    // 使用平滑滚动
    window.scrollTo({
      top: scrollPosition,
      behavior: "smooth",
    });
  };

  // 处理拖动开始
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);

    // 阻止默认事件，防止文本选择
    e.preventDefault();

    // 添加拖动时的过渡效果和鼠标样式
    if (sliderThumbRef.current) {
      sliderThumbRef.current.style.transition = "none";
    }

    // 设置全局鼠标样式
    document.body.style.cursor = "ns-resize";
  };

  // 处理拖动
  const handleDrag = (clientY: number) => {
    if (!isDragging || !sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const offsetY = clientY - rect.top;
    const percentage = (offsetY / rect.height) * 100;

    // 限制百分比在有效范围内
    const limitedPercentage = Math.max(
      0,
      Math.min(100 - thumbHeightPercentage, percentage)
    );
    setThumbPositionPercentage(limitedPercentage);

    // 计算对应的帖子索引
    const postIndex = Math.max(
      1,
      Math.min(
        totalPosts,
        Math.round(
          (limitedPercentage / (100 - thumbHeightPercentage)) *
            (totalPosts - 1) +
            1
        )
      )
    );
    setCurrentPostIndex(postIndex);

    // 计算滚动位置
    const scrollHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const scrollPosition =
      (limitedPercentage / (100 - thumbHeightPercentage)) * scrollHeight;

    // 直接滚动，拖动时不使用平滑效果
    window.scrollTo({
      top: scrollPosition,
    });
  };

  // 处理拖动结束
  const handleDragEnd = () => {
    setIsDragging(false);

    // 恢复过渡效果和鼠标样式
    if (sliderThumbRef.current) {
      sliderThumbRef.current.style.transition = "top 0.2s ease-out";
    }

    // 恢复全局鼠标样式
    document.body.style.cursor = "";
  };

  // 监听滚动事件
  React.useEffect(() => {
    const handleScroll = () => {
      if (isDragging) return;

      const scrollTop = window.scrollY;
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = (scrollTop / scrollHeight) * 100;

      // 计算滑块位置
      const thumbPosition = Math.min(
        100 - thumbHeightPercentage,
        (scrollPercentage * (100 - thumbHeightPercentage)) / 100
      );

      // 使用平滑过渡
      if (sliderThumbRef.current) {
        sliderThumbRef.current.style.transition = "top 0.2s ease-out";
      }

      setThumbPositionPercentage(thumbPosition);

      // 计算当前帖子索引
      const currentIndex = Math.max(
        1,
        Math.min(
          totalPosts,
          Math.round((scrollPercentage / 100) * (totalPosts - 1) + 1)
        )
      );
      setCurrentPostIndex(currentIndex);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDragging, thumbHeightPercentage, totalPosts]);

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
  }, [isDragging, handleDrag, handleDragEnd]);

  return (
    <div ref={containerRef} className={cn("flex items-center", className)}>
      {/* 左侧：最早内容按钮、垂直线、滑块和最新回复按钮 */}
      <div className="flex flex-col items-start mr-4">
        {/* 最早内容按钮 */}
        <button
          onClick={scrollToTop}
          className="flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronsUp className="h-5 w-5 mr-1" />
          <span>最早内容</span>
        </button>

        <div className="relative ml-2" style={{ height: "200px" }}>
          <div
            ref={sliderRef}
            onClick={handleSliderClick}
            className="absolute inset-0 bg-gray-200 cursor-pointer rounded-sm hover:bg-gray-300 transition-colors"
            style={{ width: "4px" }}
          />

          {/* 滑块 */}
          <div
            ref={sliderThumbRef}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            className={cn(
              "absolute left-0 bg-primary rounded-sm transition-shadow",
              isDragging
                ? "cursor-grabbing shadow-md"
                : "cursor-ns-resize hover:bg-blue-600"
            )}
            style={{
              width: "5px",
              height: `${thumbHeightPercentage}%`,
              top: `${thumbPositionPercentage}%`,
              transition: "top 0.2s ease-out, background-color 0.2s",
            }}
          />

          {/* 右侧帖子信息 - 跟随滑块一起滑动 */}
          <div
            className="absolute flex flex-col justify-center ml-4"
            style={{
              top: `calc(${thumbPositionPercentage}% + ${
                thumbHeightPercentage / 2
              }% - 1.5rem)`,
              left: "5px",
              transition: "top 0.2s ease-out",
            }}
          >
            <div className="text-base font-medium text-gray-800 whitespace-nowrap">
              {currentPostIndex} / {totalPosts} 楼
            </div>
            <div className="text-sm text-gray-500 mt-1 whitespace-nowrap">
              {formattedDate}
            </div>
          </div>
        </div>

        {/* 最新回复按钮 */}
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
