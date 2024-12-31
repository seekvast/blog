"use client";

import * as React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";
import { http } from "@/lib/request";
import { ChevronDown } from "lucide-react";

interface Board {
  id: number;
  name: string;
  avatar: string;
  desc: string;
  slug: string;
  visibility: number;
  is_nsfw: number;
  category: {
    id: number;
    name: string;
  };
}

interface BoardsResponse {
  current_page: number;
  items: Board[];
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
}

export default function BoardsPage() {
  const { data: session } = useSession();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"recommended" | "joined">("recommended");
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);

  const fetchBoards = async (page: number = 1, isReset: boolean = false) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: String(page),
        per_page: "10",
        ...(categoryFilter && { category_id: String(categoryFilter) }),
      }).toString();

      const response = await http.get<{
        code: number;
        data: BoardsResponse;
        message: string;
      }>(`/api/boards?${queryParams}`);

      if (response.code === 0) {
        setBoards((prevBoards) =>
          isReset
            ? response.data.items
            : [...prevBoards, ...response.data.items]
        );
        setCurrentPage(response.data.current_page);
        setTotalPages(response.data.last_page);
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
      const queryParams = new URLSearchParams({
        page: String(currentPage + 1),
        per_page: "10",
        ...(categoryFilter && { category_id: String(categoryFilter) }),
      }).toString();

      const response = await http.get<{
        code: number;
        data: BoardsResponse;
        message: string;
      }>(`/api/boards?${queryParams}`);

      if (response.code === 0) {
        setBoards((prev) => [...prev, ...response.data.items]);
        setCurrentPage(response.data.current_page);
        setTotalPages(response.data.last_page);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("加载失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards(1, true);
  }, [categoryFilter, activeTab]);

  return (
    <div className="flex flex-col">
      {/* 顶部导航 */}
      <div className="bg-white">
        <div className="mx-auto w-full px-8">
          <div className="flex h-[60px] items-center justify-between border-b border-[#EAEAEA]">
            <div className="flex items-center space-x-8">
              <Button
                variant="ghost"
                className={`h-8 px-1 font-medium ${
                  activeTab === "recommended"
                    ? "text-primary hover:bg-transparent hover:text-primary"
                    : "text-muted-foreground hover:bg-transparent hover:text-foreground"
                }`}
                onClick={() => setActiveTab("recommended")}
              >
                推薦
              </Button>
              <Button
                variant="ghost"
                className={`h-8 px-1 font-medium ${
                  activeTab === "joined"
                    ? "text-primary hover:bg-transparent hover:text-primary"
                    : "text-muted-foreground hover:bg-transparent hover:text-foreground"
                }`}
                onClick={() => setActiveTab("joined")}
              >
                已加入
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 space-x-2 text-muted-foreground hover:bg-transparent hover:text-foreground"
              onClick={() => setCategoryFilter(null)}
            >
              全部
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 看板列表 */}
      <div className="mx-auto w-full px-8">
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
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={board.avatar} alt={board.name} />
                    <AvatarFallback>{board.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/b/${board.slug}`}
                        className="text-sm font-medium leading-none hover:underline"
                      >
                        {board.name}
                      </Link>
                      {board.is_nsfw === 1 && (
                        <Badge variant="destructive" className="h-5">
                          NSFW
                        </Badge>
                      )}
                      {board.visibility === 2 && (
                        <Badge variant="secondary" className="h-5">
                          私密
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {board.desc}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  加入
                </Button>
              </div>
            ))}
          </InfiniteScroll>
        )}
      </div>
    </div>
  );
}
