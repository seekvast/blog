"use client";

import * as React from "react";
import { useCallback, useRef } from "react";
import { Loader2 } from "lucide-react";

interface InfiniteScrollProps {
  children: React.ReactNode;
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  currentPage: number;
  className?: string;
  loadingIndicator?: React.ReactNode;
  disableInitialCheck?: boolean;
}

export function InfiniteScroll({
  children,
  loading,
  hasMore,
  onLoadMore,
  currentPage,
  className = "",
  loadingIndicator = (
    <div className="flex justify-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  ),
  disableInitialCheck = false,
}: InfiniteScrollProps) {
  const observerRef = useRef<IntersectionObserver>();

  const lastItemRef = useCallback(
    (node: HTMLElement | null) => {
      if (loading) return;

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            onLoadMore();
          }
        },
        {
          root: null,
          rootMargin: "100px",
          threshold: 0,
        }
      );

      if (node) {
        observerRef.current.observe(node);

        // 立即检查元素是否在视口中
        if (!disableInitialCheck) {
          const rect = node.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          if (rect.top < windowHeight) {
            onLoadMore();
          }
        }
      }
    },
    [loading, hasMore, onLoadMore, disableInitialCheck]
  );

  // 克隆最后一个子元素并添加 ref
  const childrenArray = React.Children.toArray(children);
  const lastChild = childrenArray[childrenArray.length - 1];

  const enhancedChildren = childrenArray.map((child, index) => {
    if (index === childrenArray.length - 1) {
      return React.cloneElement(child as React.ReactElement, {
        ref: lastItemRef,
      });
    }
    return child;
  });

  return (
    <div className={className}>
      {childrenArray.length === 0 ? (
        <div className="flex justify-center py-8 text-muted-foreground">
          這裡空空如也
        </div>
      ) : (
        <>
          {enhancedChildren}
          {/* 加载更多时显示加载指示器 */}
          {loading && loadingIndicator}
        </>
      )}
    </div>
  );
}
