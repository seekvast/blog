"use client";

import * as React from "react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";
import { api } from "@/lib/api";
import { debounce } from "@/lib/utils";
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
import { SubscribeBoardDialog } from "@/components/board/subscribe-board-dialog";
import { BoardApprovalMode } from "@/constants/board-approval-mode";
import { BoardItem } from "@/components/board/board-item";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useBoardActions } from "@/hooks/use-board-actions";

export default function BoardsPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"recommended" | "joined">(
    "recommended"
  );
  const { requireAuth } = useRequireAuth();
  const queryClient = useQueryClient();
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
  const [subscribeBoardOpen, setSubscribeBoardOpen] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const { handleSubscribe } = useBoardActions();

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.common.categories(),
    staleTime: 1 * 60 * 1000,
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

  const handleSubscribeBoard = (boardId: number) => {
    const board = boards.find((b) => b.id === boardId);
    if (!board) return;
    if (board.history) return;
    if (board.approval_mode === BoardApprovalMode.NONE) {
      handleSubscribe(board.id);
    } else {
      setSelectedBoard(board);
      setSubscribeBoardOpen(true);
    }
  };

  const { mutate: blockBoard } = useMutation({
    mutationFn: (boardId: number) => api.boards.block({ board_id: boardId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
    },
  });

  const debouncedBlockBoard = useMemo(
    () =>
      debounce((boardId: number) => {
        blockBoard(boardId);
      }, 300),
    [blockBoard]
  );

  const handleBlockBoard = (boardId: number) => {
    debouncedBlockBoard(boardId);
  };

  return (
    <div className="flex flex-col">
      {/* 顶部导航 */}
      <div className="bg-background">
        <div className="mx-auto w-full">
          <div className="flex h-[40px] items-center justify-between relative px-6 lg:border-b">
            <div className="flex items-center space-x-8 relative ">
              {[
                { key: "recommended", label: "推荐" },
                { key: "joined", label: "已加入" },
              ].map((tab, idx) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`relative px-2 py-1 transition-colors duration-150
                    ${
                      activeTab === tab.key
                        ? "text-primary font-bold"
                        : "text-muted-foreground font-normal"
                    }
                  `}
                  onClick={() => {
                    if (tab.key === "joined") {
                      requireAuth(() => {
                        setActiveTab("joined");
                      });
                    } else {
                      setActiveTab("recommended");
                    }
                  }}
                >
                  {tab.label}
                  {activeTab === tab.key && (
                    <span
                      className="absolute left-0 right-0 -bottom-1 h-[3px] rounded bg-primary"
                      style={{ width: "100%" }}
                    />
                  )}
                </button>
              ))}
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
              <div className="px-6" key={board.id}>
                <BoardItem
                  board={board}
                  onSubscribe={handleSubscribeBoard}
                  onBlock={handleBlockBoard}
                />
              </div>
            ))}
          </InfiniteScroll>
        )}
      </div>
      {/* 加入看板对话框 */}
      {selectedBoard && (
        <SubscribeBoardDialog
          open={subscribeBoardOpen}
          onOpenChange={setSubscribeBoardOpen}
          boardId={selectedBoard.id}
          question={selectedBoard.question}
          onSuccess={() =>
            queryClient.invalidateQueries({ queryKey: ["boards"] })
          }
        />
      )}
    </div>
  );
}
