"use client"

import * as React from "react"
import { useEffect, useRef, useCallback } from "react"
import { Loader2 } from "lucide-react"

interface InfiniteScrollProps {
  children: React.ReactNode
  loading: boolean
  hasMore: boolean
  onLoadMore: () => void
  className?: string
  loadingComponent?: React.ReactNode
  endMessage?: React.ReactNode
  rootMargin?: string
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
  endMessage = (
    <div className="flex justify-center py-8">
      <p className="text-sm text-muted-foreground">沒有更多數據了</p>
    </div>
  ),
  rootMargin = "100px",
}: InfiniteScrollProps) {
  const loadingRef = useRef(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastItemRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return
      if (observerRef.current) observerRef.current.disconnect()

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
            loadingRef.current = true
            onLoadMore()
          }
        },
        {
          rootMargin,
        }
      )

      if (node) observerRef.current.observe(node)
    },
    [loading, hasMore, onLoadMore, rootMargin]
  )

  useEffect(() => {
    loadingRef.current = loading
  }, [loading])

  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child) && index === React.Children.count(children) - 1) {
          return React.cloneElement(child as React.ReactElement, {
            ref: lastItemRef,
          })
        }
        return child
      })}
      
      {loading && loadingComponent}
      {!loading && !hasMore && endMessage}
    </div>
  )
}
