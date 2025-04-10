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
}

export function PostNavigator({
  totalPosts,
  discussionDate,
  hasUnreadPosts = false,
  className,
}: PostNavigatorProps) {
  const [currentPostIndex, setCurrentPostIndex] = React.useState(1);
  const [isDragging, setIsDragging] = React.useState(false);
  const sliderRef = React.useRef<HTMLDivElement>(null);
  const sliderThumbRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // 格式化讨论日期
  const formattedDate = React.useMemo(() => {
    return format(new Date(discussionDate), "MMMM yyyy", { locale: zhCN });
  }, [discussionDate]);

  // 计算滑块高度百分比
  const thumbHeightPercentage = React.useMemo(() => {
    // 滑块最小占比20%，最大占比80%
    const minPercentage = 20;
    const maxPercentage = 80;

    // 楼层数越少，滑块越大
    // 当楼层数为1时，滑块占比为maxPercentage
    // 当楼层数为50或更多时，滑块占比为minPercentage
    const percentage = Math.max(
      minPercentage,
      maxPercentage - ((totalPosts - 1) / 49) * (maxPercentage - minPercentage)
    );

    return Math.min(percentage, maxPercentage);
  }, [totalPosts]);

  // 计算滑块位置百分比（基于当前楼层）
  const thumbPositionPercentage = React.useMemo(() => {
    if (totalPosts <= 1) return 0;

    // 计算可滚动范围（考虑滑块自身高度）
    const scrollableRange = 100 - thumbHeightPercentage;

    // 计算当前位置百分比
    return ((currentPostIndex - 1) / (totalPosts - 1)) * scrollableRange;
  }, [currentPostIndex, totalPosts, thumbHeightPercentage]);

  // 滚动到顶部（主贴）
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 滚动到底部（最新评论）
  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  // 根据点击位置滚动到指定楼层
  const handleSliderClick = (e: React.MouseEvent) => {
    if (!sliderRef.current || isDragging) return;

    const sliderRect = sliderRef.current.getBoundingClientRect();
    const thumbHeight = (thumbHeightPercentage / 100) * sliderRect.height;
    const clickY = e.clientY - sliderRect.top;

    // 计算可滚动范围
    const scrollableHeight = sliderRect.height - thumbHeight;

    // 如果点击位置在滑块范围内，不做处理
    const thumbTop = (thumbPositionPercentage / 100) * sliderRect.height;
    if (clickY >= thumbTop && clickY <= thumbTop + thumbHeight) {
      return;
    }

    // 计算目标位置百分比
    let targetPercentage;
    if (clickY < thumbTop) {
      // 点击位置在滑块上方
      targetPercentage = Math.max(0, clickY / scrollableHeight);
    } else {
      // 点击位置在滑块下方
      targetPercentage = Math.min(1, clickY / scrollableHeight);
    }

    // 计算目标楼层
    const targetIndex = Math.max(
      1,
      Math.min(Math.round(targetPercentage * (totalPosts - 1) + 1), totalPosts)
    );

    // 更新当前楼层
    setCurrentPostIndex(targetIndex);

    // 滚动到对应位置
    const scrollHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const targetPosition =
      ((targetIndex - 1) / (totalPosts - 1)) * scrollHeight;

    window.scrollTo({
      top: targetPosition,
      behavior: "smooth",
    });
  };

  // 处理滑块拖动开始
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // 处理滑块拖动
  const handleDrag = React.useCallback(
    (clientY: number) => {
      if (!isDragging || !sliderRef.current) return;

      const sliderRect = sliderRef.current.getBoundingClientRect();
      const thumbHeight = (thumbHeightPercentage / 100) * sliderRect.height;

      // 计算可滚动范围
      const scrollableHeight = sliderRect.height - thumbHeight;

      // 计算拖动位置百分比（限制在0-1之间）
      const dragPercentage = Math.max(
        0,
        Math.min((clientY - sliderRect.top) / scrollableHeight, 1)
      );

      // 计算目标楼层
      const targetIndex = Math.max(
        1,
        Math.min(Math.round(dragPercentage * (totalPosts - 1) + 1), totalPosts)
      );

      // 更新当前楼层
      setCurrentPostIndex(targetIndex);

      // 滚动到对应位置
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const targetPosition =
        ((targetIndex - 1) / (totalPosts - 1)) * scrollHeight;

      window.scrollTo({
        top: targetPosition,
      });
    },
    [isDragging, totalPosts, thumbHeightPercentage]
  );

  // 处理滑块拖动结束
  const handleDragEnd = React.useCallback(() => {
    setIsDragging(false);
  }, []);

  // 监听滚动事件，更新当前帖子索引
  React.useEffect(() => {
    const handleScroll = () => {
      if (isDragging) return;

      const scrollTop = window.scrollY;
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = scrollHeight > 0 ? scrollTop / scrollHeight : 0;

      // 更新当前帖子索引
      const newIndex = Math.max(
        1,
        Math.min(
          Math.round(scrollPercentage * (totalPosts - 1) + 1),
          totalPosts
        )
      );

      setCurrentPostIndex(newIndex);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDragging, totalPosts]);

  // 监听鼠标移动和触摸移动事件
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleDrag(e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleDrag(e.touches[0].clientY);
      }
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("mouseup", handleDragEnd);
      document.addEventListener("touchend", handleDragEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("mouseup", handleDragEnd);
      document.removeEventListener("touchend", handleDragEnd);
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

        {/* 垂直线和滑块 - 靠左对齐，与ChevronUp图标对齐 */}
        <div className="relative ml-2" style={{ height: "200px" }}>
          {/* 垂直线（轨道） */}
          <div
            ref={sliderRef}
            onClick={handleSliderClick}
            className="absolute inset-0 bg-gray-200 cursor-pointer rounded-sm"
            style={{ width: "4px" }}
          />

          {/* 滑块 */}
          <div
            ref={sliderThumbRef}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            className={cn(
              "absolute left-0 right-0 bg-blue-700 rounded-sm cursor-grab",
              isDragging ? "cursor-grabbing" : ""
            )}
            style={{
              width: "5px",
              height: `${thumbHeightPercentage}%`,
              top: `${thumbPositionPercentage}%`,
            }}
          />
          {/* 右侧帖子信息 */}
          <div className="flex flex-col justify-center ml-4">
            <div className="text-base font-medium text-gray-800">
              {currentPostIndex} / {totalPosts} 楼
            </div>
            <div className="text-sm text-gray-500 mt-1">{formattedDate}</div>
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
