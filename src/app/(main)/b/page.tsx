"use client";

import * as React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";
import { api } from "@/lib/api";
import { ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

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
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"recommended" | "joined">(
    "recommended"
  );
  const queryClient = useQueryClient();
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);

  const { mutate: joinBoard } = useMutation({
    mutationFn: (boardId: number) => api.boards.join({ board_id: boardId }),
    onSuccess: (_, boardId) => {
      // 立即使缓存失效
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      
      // 更新本地状态
      setBoards(currentBoards => 
        currentBoards.map(board => {
          if (board.id === boardId) {
            return { ...board, is_joined: 1 };
          }
          return board;
        })
      );
    },
  });

  const {
    data: queryData,
    isLoading: queryLoading,
    error: queryError,
  } = useQuery({
    queryKey: ["boards", activeTab, categoryFilter],
    queryFn: async () => {
      return api.boards.list({
        page: 1,
        per_page: 10,
        q: activeTab,
        ...(categoryFilter && { category_id: categoryFilter }),
      });
    },
  });

  useEffect(() => {
    setLoading(queryLoading);

    if (queryData && !queryLoading) {
      setBoards(queryData.items);
      setCurrentPage(queryData.current_page);
      setTotalPages(queryData.last_page);
    }

    if (queryError) {
      console.error("Failed to fetch boards:", queryError);
      setError("加载失败，请重试");
    }
  }, [queryData, queryLoading, queryError]);

  const fetchBoards = async (
    page: number = 1,
    isReset: boolean = false,
    tabType: "recommended" | "joined" = "recommended"
  ) => {
    try {
      setLoading(true);

      if (tabType !== activeTab) {
        setActiveTab(tabType);
        return;
      }

      if (page === 1 && queryData) {
        setBoards(isReset ? queryData.items : [...boards, ...queryData.items]);
        setCurrentPage(queryData.current_page);
        setTotalPages(queryData.last_page);
      } else {
        const data = await api.boards.list({
          page,
          per_page: 10,
          q: activeTab,
          ...(categoryFilter && { category_id: categoryFilter }),
        });

        setBoards((prevBoards) =>
          isReset ? data.items : [...prevBoards, ...data.items]
        );
        setCurrentPage(data.current_page);
        setTotalPages(data.last_page);
      }
    } catch (error) {
      console.error("Failed to fetch boards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (loading || currentPage >= totalPages) return;
    setLoading(true);

    try {
      const data = await api.boards.list({
        page: currentPage + 1,
        per_page: 10,
        q: activeTab,
      });
      setBoards((prev) => [...prev, ...data.items]);
      setCurrentPage(data.current_page);
      setTotalPages(data.last_page);
    } catch (err) {
      setError("加载失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards(1, true, activeTab);
  }, [categoryFilter, activeTab]);

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
        {loading && boards.length === 0 ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin" />
          </div>
        ) : (
          <InfiniteScroll
            loading={loading}
            hasMore={currentPage < totalPages}
            onLoadMore={handleLoadMore}
            className="divide-y"
          >
            {boards.map((board) => (
              <div
                key={board.id}
                className="flex items-center justify-between py-4"
              >
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
