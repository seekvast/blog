"use client";

import * as React from "react";
import { useEffect, useRef, useCallback } from "react";
import { Loader2 } from "lucide-react";

interface InfiniteScrollProps {
  children: React.ReactNode;
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  className?: string;
  loadingComponent?: React.ReactNode;
  endMessage?: React.ReactNode;
  rootMargin?: string;
  waitForScroll?: boolean;
}

export function InfiniteScroll({
  children,
  loading,
  hasMore,
  onLoadMore,
  className = "",
  loadingComponent = (
    <div className="flex justify-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  ),
  endMessage = <div className="flex justify-center"></div>,
  rootMargin = "100px",
  waitForScroll = false,
}: InfiniteScrollProps) {
  const [hasScrolled, setHasScrolled] = React.useState(false);

  React.useEffect(() => {
    if (!waitForScroll) {
      setHasScrolled(true);
      return;
    }
    const handleScroll = () => setHasScrolled(true);
    window.addEventListener("scroll", handleScroll, { once: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [waitForScroll]);
  const loadingRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useCallback(
    (node: HTMLDivElement) => {
      if (waitForScroll && !hasScrolled) return;
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
            loadingRef.current = true;
            onLoadMore();
          }
        },
        {
          rootMargin,
        }
      );

      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore, onLoadMore, rootMargin, waitForScroll, hasScrolled]
  );

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  return (
    <div className={className}>
      {children}
      {hasMore && (
        <div ref={lastItemRef} style={{ height: "1px", margin: 0 }} />
      )}

      {loading && loadingComponent}
      {!loading && !hasMore && endMessage}
    </div>
  );
}
