"use client";

import * as React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { LayoutGrid, List, ChevronDown, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Suspense } from "react";
import { api } from "@/lib/api";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Board, BoardChild } from "@/types/board";
import { Discussion } from "@/types/discussion";
import { DiscussionItem } from "@/components/home/discussion-item";
import { InfiniteScroll } from "@/components/common/infinite-scroll";
import { BoardUserRole } from "@/constants/board-user-role";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


type SortBy = "hot" | "create" | "reply";

export default function BoardPage() {
  return (
    <ErrorBoundary fallback={<div>出错了，请刷新页面重试</div>}>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <BoardContent />
      </Suspense>
    </ErrorBoundary>
  );
}

function BoardContent() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [board, setBoard] = useState<Board | null>(null);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [discussionsLoading, setDiscussionsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [boardChildren, setBoardChildren] = useState<BoardChild[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver>();
  const [hasMore, setHasMore] = useState(true);
  const [displayMode, setDisplayMode] = useState<"grid" | "list">("grid");
  const sortOptions = {
    hot: "热门",
    create: "最新发表",
    reply: "最后回复",
  };
  const [sortBy, setSortBy] = useState<SortBy>("hot");
  const handleLoadMore = useCallback(() => {
    if (!discussionsLoading && hasMore) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [discussionsLoading, hasMore]);

  const fetchBoardDetail = async () => {
    try {
      setLoading(true);
      //   if (!params?.slug || Array.isArray(params.slug)) {
      //     throw new Error('Invalid board slug');
      //   }
      const data = await api.boards.get({ slug: params?.slug });
      setBoard(data);
    } catch (error) {
      console.error("Failed to fetch board detail:", error);
      setError("获取看板详情失败");
    } finally {
      setLoading(false);
    }
  };

  const fetchBoardChildren = async () => {
    try {
      if (!board?.id) return;
      const data = await api.boards.getChildren(board.id);
      setBoardChildren(data.items);
      if (data.items.length > 0 && !selectedChildId) {
        setSelectedChildId(data.items[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch board children:", error);
      setError("获取子板块失败");
    }
  };

  const fetchDiscussions = async (sortBy: SortBy="hot") => {
    try {
      setDiscussionsLoading(true);
      if (!board?.id) return;

      const data = await api.discussions.list({
        board_id: board.id,
        board_child_id: selectedChildId || 0,
        page: currentPage,
        per_page: 10,
        sort: sortBy,
      });

      if (currentPage === 1) {
        setDiscussions(data.items);
      } else {
        setDiscussions((prev) => [...prev, ...data.items]);
      }

      setTotalPages(data.last_page);
      setHasMore(currentPage < data.last_page);
    } catch (error) {
      console.error("Failed to fetch discussions:", error);
      setError("获取讨论列表失败");
    } finally {
      setDiscussionsLoading(false);
    }
  };

  useEffect(() => {
    if (params?.slug) {
      fetchBoardDetail();
    }
  }, [params?.slug]);

  useEffect(() => {
    if (board?.id) {
      fetchBoardChildren();
    }
  }, [board?.id]);

  useEffect(() => {
    if (board?.id) {
      setCurrentPage(1);
      setDiscussions([]);
      fetchDiscussions();
    }
  }, [board?.id, selectedChildId]);

  useEffect(() => {
    if (board?.id && currentPage > 1) {
      fetchDiscussions();
    }
  }, [currentPage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        {error}
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        板块不存在
      </div>
    );
  }

  return (
    <div className="flex flex-col mx-auto w-full">
      {/* 看板信息 */}
      <div className="bg-background">
        <div className="">
          <div className="flex items-start space-x-3 pb-4">
            <Avatar className="h-14 w-14">
              <AvatarImage src={board.avatar} alt={board.name} />
              <AvatarFallback>{board.name[0]}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h1 className="text-lg font-medium">{board.name}</h1>
                  {board.is_nsfw === 1 && (
                    <Badge variant="destructive" className="h-5">
                      成人
                    </Badge>
                  )}
                  {/* {board.visibility === 1 && (
                    <Badge variant="secondary">私密</Badge>
                  )} */}
                </div>
                <div className="flex items-center space-x-4">
                  {/* 如果是创建者或管理员，则显示设置按钮 */}
                  {board.board_user &&
                    (board.board_user?.user_role === BoardUserRole.CREATOR ||
                      board.board_user?.user_role ===
                        BoardUserRole.MODERATOR) && (
                      <Link href={`/b/${board.slug}/settings`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="space-x-1 text-primary rounded-full"
                        >
                          设定
                        </Button>
                      </Link>
                    )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="space-x-1 rounded-full"
                  >
                    已加入
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {/* {board.visibility === 1 ? "私密" : "公开"} ·{" "} */}
                {board.category?.name}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {board.desc}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 顶部导航 */}
      <div className="bg-background">
        <div className="mx-auto w-full">
          {/* 顶部导航 */}
          <div className="bg-background">
            <div className="mx-auto">
              <div className="flex h-[40px] items-center justify-between border-b">
                <div className="flex items-center space-x-4 lg:space-x-8">
                  <button
                    type="button"
                    className="h-8 font-medium text-primary hover:bg-transparent hover:text-primary"
                  >
                    文章
                  </button>
                  <button
                    type="button"
                    className="h-8 font-medium text-muted-foreground hover:bg-transparent hover:text-foreground"
                  >
                    规则
                  </button>
                  <button
                    type="button"
                    className="h-8 font-medium text-muted-foreground hover:bg-transparent hover:text-foreground"
                  >
                    子版
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div
                        className="inline-flex items-center space-x-1 font-medium text-muted-foreground cursor-pointer"
                      >
                        <span>{sortOptions[sortBy]}</span>
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {Object.entries(sortOptions).map(([key, label]) => (
                        <DropdownMenuItem
                          key={key}
                          className={cn(sortBy === key && "bg-accent", "cursor-pointer")}
                          onClick={() => {
                            setSortBy(key as SortBy);
                            fetchDiscussions(key as SortBy);
                          }}
                        >
                          {label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {/* <button
                    type="button"
                    className="inline-flex items-center space-x-2 font-medium text-muted-foreground"
                  >
                    热门
                    <ChevronDown className="h-4 w-4" />
                  </button> */}
                  <button
                    type="button"
                    className="h-8 text-muted-foreground hover:bg-transparent hover:text-foreground"
                    onClick={() =>
                      setDisplayMode((prev) =>
                        prev === "grid" ? "list" : "grid"
                      )
                    }
                  >
                    {displayMode === "grid" ? (
                      <LayoutGrid className="h-5 w-5" />
                    ) : (
                      <List className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 子导航 */}
          <div className="flex items-center space-x-4 py-3 text-sm">
            <Badge
              variant={!selectedChildId ? "default" : "secondary"}
              className={`cursor-pointer hover:bg-primary/90 ${
                !selectedChildId ? "" : "hover:bg-secondary/80"
              }`}
              onClick={() => setSelectedChildId(null)}
            >
              全部
            </Badge>
            {boardChildren.map((child) => (
              <Badge
                key={child.id}
                variant={selectedChildId === child.id ? "default" : "secondary"}
                className={`cursor-pointer hover:bg-primary/90 ${
                  selectedChildId === child.id ? "" : "hover:bg-secondary/80"
                }`}
                onClick={() => setSelectedChildId(child.id)}
              >
                {child.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* 帖子列表 */}
      <div className="mx-auto w-full">
        <InfiniteScroll
          loading={discussionsLoading}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          currentPage={currentPage}
          className="space-y-4 py-4 divide-y"
        >
          {discussions.map((discussion) => (
            <DiscussionItem
              key={discussion.first_post_id}
              discussion={discussion}
              displayMode={displayMode}
            />
          ))}
        </InfiniteScroll>
      </div>
      {/* 4. 添加加载状态指示器 */}
      <div className="h-10 flex items-center justify-center text-muted-foreground">
        {!hasMore && discussions.length > 0 && <div>No more items</div>}
      </div>
    </div>
  );
}
