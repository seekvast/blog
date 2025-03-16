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
import { ChevronDown } from "lucide-react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Board {
  id: number;
  name: string;
  avatar: string;
  desc: string;
  slug: string;
  visibility: number;
  is_nsfw: number;
  is_joined?: number;
  category: {
    id: number;
    name: string;
  };
}

export default function BoardsPage() {
  const { data: session } = useSession();
  const [boards, setBoards] = useState<Board[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"recommended" | "joined">("recommended");
  const queryClient = useQueryClient();
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);

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
      return data.current_page < data.last_page ? data.current_page + 1 : undefined;
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
            <button
              className="inline-flex items-center font-medium text-muted-foreground space-x-2 hover:bg-transparent hover:text-foreground"
              onClick={() => setCategoryFilter(null)}
            >
              全部
              <ChevronDown className="h-4 w-4" />
            </button>
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
              <div key={board.id} className="flex items-center justify-between py-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={board.avatar} alt={board.name} />
                    <AvatarFallback>{board.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/b/${board.slug}`}
                        className="text-lg font-medium hover:text-primary"
                      >
                        {board.name}
                      </Link>
                      {board.is_nsfw === 1 && (
                        <Badge variant="destructive" className="h-5">
                          成人
                        </Badge>
                      )}
                      {/* {board.visibility === 1 && (
                        <Badge variant="secondary" className="h-5">
                          私密
                        </Badge>
                      )} */}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      {board.category && <span>{board.category.name}</span>}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {board.desc}
                    </p>
                  </div>
                </div>
                {board.is_joined ? (
                  <Button variant="outline" size="sm">
                    已加入
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => joinBoard(board.id)}
                  >
                    加入
                  </Button>
                )}
              </div>
            ))}
          </InfiniteScroll>
        )}
      </div>
    </div>
  );
}
