"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";
import { api } from "@/lib/api";
import { Board } from "@/types/board";
import { ChevronDown } from "lucide-react";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { JoinBoardDialog } from "@/components/board/join-board-dialog";
import { BoardApprovalMode } from "@/constants/board-approval-mode";
import { BoardItem } from "@/components/board/board-item";

export default function BoardsPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"recommended" | "joined">(
    "recommended"
  );
  const queryClient = useQueryClient();
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
  const [joinBoardOpen, setJoinBoardOpen] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.common.categories(),
    staleTime: 1 * 60 * 1000,
  });

  const { mutate: joinBoard } = useMutation({
    mutationFn: (boardId: number) => api.boards.join({ board_id: boardId }),
    onSuccess: (_, boardId) => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      setBoards((currentBoards) =>
        currentBoards.map((board) => {
          if (board.id === boardId) {
            return { ...board, is_joined: 1 };
          }
          return board;
        })
      );
    },
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error: queryError,
  } = useInfiniteQuery({
    queryKey: ["boards", activeTab, categoryFilter],
    queryFn: async ({ pageParam = 1 }) => {
      return api.boards.list({
        page: pageParam,
        per_page: 10,
        q: activeTab,
        ...(categoryFilter && { category_id: categoryFilter }),
      });
    },
    getNextPageParam: (data) => {
      return data.current_page < data.last_page
        ? data.current_page + 1
        : undefined;
    },
    initialPageParam: 1,
  });

  useEffect(() => {
    if (data) {
      // 合并所有页面的数据
      const allBoards = data.pages.flatMap((page) => page.items);
      setBoards(allBoards);
    }

    if (isError && queryError) {
      setError("加载失败，请重试");
      console.error("Failed to fetch boards:", queryError);
    }
  }, [data, isLoading, isFetchingNextPage, isError, queryError]);

  const handleLoadMore = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  };

  const handleJoinBoard = (boardId: number) => {
    const board = boards.find((b) => b.id === boardId);
    if (!board) return;
    
    if (board.approval_mode === BoardApprovalMode.NONE || board.approval_mode === BoardApprovalMode.AUTO) {
      joinBoard(board.id);
    } else {
      setSelectedBoard(board);
      setJoinBoardOpen(true);
    }
  };

  const handleLeaveBoard = (boardId: number) => {
    // TODO: 实现退出看板逻辑
  };

  return (
    <div className="flex flex-col">
      {/* 顶部导航 */}
      <div className="bg-background">
        <div className="mx-auto w-full">
          <div className="flex h-[40px] items-center justify-between lg:border-b">
            <div className="flex items-center space-x-4 lg:space-x-4">
              <button
                type="button"
                className={`font-medium text-muted-foreground ${
                  activeTab === "recommended"
                    ? "text-primary hover:bg-transparent hover:text-primary"
                    : "hover:bg-transparent hover:text-foreground"
                }`}
                onClick={() => setActiveTab("recommended")}
              >
                推薦
              </button>
              <button
                type="button"
                className={`font-medium text-muted-foreground ${
                  activeTab === "joined"
                    ? "text-primary hover:bg-transparent hover:text-primary"
                    : "hover:bg-transparent hover:text-foreground"
                }`}
                onClick={() => setActiveTab("joined")}
              >
                已加入
              </button>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <span className="inline-flex items-center font-medium text-muted-foreground space-x-2  ml-4 cursor-pointer">
                  {categoryFilter
                    ? categories.find((c) => c.id === categoryFilter)?.name ||
                      "加载中..."
                    : "全部"}
                  <ChevronDown className="h-4 w-4 ml-1" />
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="min-w-[120px]" align="end">
                <DropdownMenuLabel className="text-center">
                  选择分类
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className={`justify-center text-center !cursor-pointer ${
                      categoryFilter === null
                        ? "bg-accent text-accent-foreground font-medium"
                        : ""
                    }`}
                    onClick={() => setCategoryFilter(null)}
                  >
                    全部
                  </DropdownMenuItem>
                  {categoriesLoading ? (
                    <DropdownMenuItem
                      disabled
                      className="justify-center text-center !cursor-pointer"
                    >
                      加载中...
                    </DropdownMenuItem>
                  ) : (
                    categories.map((category) => (
                      <DropdownMenuItem
                        key={category.id}
                        className={`justify-center text-center !cursor-pointer ${
                          categoryFilter === category.id
                            ? "bg-accent text-accent-foreground font-medium"
                            : ""
                        }`}
                        onClick={() => setCategoryFilter(category.id)}
                      >
                        {category.name}
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* 看板列表 */}
      <div className="mx-auto w-full">
        {isLoading && boards.length === 0 ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin" />
          </div>
        ) : (
          <InfiniteScroll
            loading={isFetchingNextPage}
            hasMore={hasNextPage}
            onLoadMore={handleLoadMore}
            className="divide-y"
          >
            {boards.map((board) => (
              <BoardItem 
                key={board.id} 
                board={board} 
                onJoin={handleJoinBoard} 
                onLeave={handleLeaveBoard} 
              />
            ))}
          </InfiniteScroll>
        )}
      </div>
      {/* 加入看板对话框 */}
      {selectedBoard && (
        <JoinBoardDialog
          open={joinBoardOpen}
          onOpenChange={setJoinBoardOpen}
          boardId={selectedBoard.id}
          question={selectedBoard.question}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["recommend-boards"] });
          }}
        />
      )}
    </div>
  );
}
