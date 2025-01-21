"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  MessageSquare,
  Heart,
  Share2,
  MoreHorizontal,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useBoardChildrenStore } from "@/store/board-children";

interface Board {
  id: number;
  name: string;
  avatar: string;
  creator_hashid: string;
  slug: string;
  desc: string;
  visibility: number;
  badge_visible: number[];
  category_id: number;
  child_id: number;
  is_nsfw: number;
  approval_mode: number;
  question: string;
  answer: string;
  poll_role: number[];
  status: number;
  hashid: string;
  category: {
    id: number;
    name: string;
  };
}

interface Post {
  id: number;
  board_id: number;
  board_child_id: number;
  number: number;
  parent_id: number;
  depth: number;
  is_private: number;
  is_approved: number;
  user_hashid: string;
  edited_user_hashid: string;
  board_creator_hashid: string;
  type: string;
  content: string;
  edited_at: string | null;
  hidden_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface Discussion {
  title: string;
  comment_count: number;
  participant_count: number;
  post_number_index: number;
  user_hashid: string;
  first_post_id: number;
  last_posted_at: string;
  last_posted_user_hashid: string;
  last_post_id: number;
  last_post_number: number;
  board_id: number;
  board_child_id: number;
  board_creator_hashid: string;
  hidden_at: string | null;
  hidden_user_hashid: string;
  slug: string;
  diff_humans: string;
  is_private: number;
  is_approved: number;
  is_locked: number;
  is_sticky: number;
  view_count: number;
  votes: number;
  hotness: number;
  main_post: Post;
  board: {
    id: number;
    name: string;
  };
  board_child: {
    id: number;
    name: string;
  };
  user: {
    id: number;
    username: string;
    avatar_url: string;
  };
}

interface DiscussionsResponse {
  current_page: number;
  items: Discussion[];
  total: number;
  per_page: number;
  last_page: number;
}

interface BoardChild {
  board_id: number;
  name: string;
  creator_hashid: string;
  is_default: number;
  sort: number;
  id: number;
}

interface BoardChildrenResponse {
  items: BoardChild[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

export default function BoardDetailPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [board, setBoard] = useState<Board | null>(null);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [discussionsLoading, setDiscussionsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [boardChildren, setBoardChildren] = useState<BoardChild[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const { t } = useTranslation();
  const { getBoardChildren, setBoardChildren: setStoreBoardChildren } = useBoardChildrenStore();

  useEffect(() => {
    if (params.slug) {
      fetchBoardDetail();
    }
  }, [params.slug]);

  useEffect(() => {
    if (board?.id) {
      fetchBoardChildren();
    }
  }, [board?.id]);

  useEffect(() => {
    if (board?.id) {
      fetchDiscussions();
    }
  }, [board?.id, selectedChildId]);

  const fetchBoardDetail = async () => {
    try {
      setLoading(true);
      const response = await api.get<{
        code: number;
        data: Board;
        message: string;
      }>(`/api/board?slug=${params.slug}`);

      if (response.code === 0) {
        setBoard(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch board detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBoardChildren = async () => {
    try {
      if (!board?.id) return;

      // 先从 store 中获取
      const cachedChildren = getBoardChildren(board.id);
      if (cachedChildren) {
        setBoardChildren(cachedChildren);
        return;
      }

      // 如果 store 中没有，则请求 API
      const response = await api.get<{
        code: number;
        data: BoardChildrenResponse;
        message: string;
      }>(`/api/board/children?board_id=${board.id}`);

      if (response.code === 0) {
        setBoardChildren(response.data.items);
        // 缓存到 store 中
        setStoreBoardChildren(board.id, response.data.items);
      }
    } catch (error) {
      console.error("Failed to fetch board children:", error);
    }
  };

  const fetchDiscussions = async (page: number = 1) => {
    try {
      setDiscussionsLoading(true);
      if (!board?.id) return;

      const response = await api.get<{
        code: number;
        data: DiscussionsResponse;
        message: string;
      }>(
        `/api/discussions?board_id=${
          board.id
        }&page=${page}&per_page=10&board_child_id=${selectedChildId || ""}`
      );

      if (response.code === 0) {
        setDiscussions((prevDiscussions) =>
          page === 1
            ? response.data.items
            : [...prevDiscussions, ...response.data.items]
        );
        setCurrentPage(response.data.current_page);
        setTotalPages(response.data.last_page);
      }
    } catch (error) {
    //   console.error("Failed to fetch discussions:", error);
    } finally {
      setDiscussionsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-60px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex h-[calc(100vh-60px)] items-center justify-center">
        <p className="text-muted-foreground">看板不存在</p>
      </div>
    );
  }

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      fetchDiscussions(currentPage + 1);
    }
  };

  return (
    <div className="flex flex-col mx-auto w-full">
      {/* 看板信息 */}
      <div className="bg-background">
        <div className="">
          <div className="flex items-start space-x-3 pb-4">
            <Avatar className="h-12 w-12 rounded-lg">
              <AvatarImage src={board.avatar} alt={board.name} />
              <AvatarFallback>{board.name[0]}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h1 className="text-lg font-medium">{board.name}</h1>
                  {board.is_nsfw === 1 && (
                    <Badge
                      variant="secondary"
                      className="bg-red-50 text-red-600"
                    >
                      成人
                    </Badge>
                  )}
                  {/* {board.visibility === 1 && (
                    <Badge variant="secondary">私密</Badge>
                  )} */}
                </div>
                <Button variant="outline" size="sm" className="space-x-1">
                  已加入
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {board.visibility === 1 ? "私密" : "公开"} ·{" "}
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
          <div className="flex h-[60px] items-center justify-between border-b border-[#EAEAEA]">
            <div className="flex items-center space-x-8">
              <Button
                variant="ghost"
                className="h-8 px-1 font-medium text-primary hover:bg-transparent hover:text-primary"
              >
                文章
              </Button>
              <Button
                variant="ghost"
                className="h-8 px-1 font-medium text-muted-foreground hover:bg-transparent hover:text-foreground"
              >
                规则
              </Button>
              <Button
                variant="ghost"
                className="h-8 px-1 font-medium text-muted-foreground hover:bg-transparent hover:text-foreground"
              >
                子版
              </Button>
              <Button
                variant="ghost"
                className="h-8 px-1 font-medium text-muted-foreground hover:bg-transparent hover:text-foreground"
              >
                讨论
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 space-x-2 text-muted-foreground hover:bg-transparent hover:text-foreground"
              >
                热门
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 space-x-2 text-muted-foreground hover:bg-transparent hover:text-foreground"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-list"
                >
                  <line x1="8" x2="21" y1="6" y2="6" />
                  <line x1="8" x2="21" y1="12" y2="12" />
                  <line x1="8" x2="21" y1="18" y2="18" />
                  <line x1="3" x2="3.01" y1="6" y2="6" />
                  <line x1="3" x2="3.01" y1="12" y2="12" />
                  <line x1="3" x2="3.01" y1="18" y2="18" />
                </svg>
              </Button>
            </div>
          </div>

          {/* 子导航 */}
          <div className="flex items-center space-x-4 py-3 text-sm">
            <Button
              variant={!selectedChildId ? "default" : "ghost"}
              size="sm"
              className={`rounded-full ${
                !selectedChildId ? "text-white" : "text-muted-foreground"
              }`}
              onClick={() => setSelectedChildId(null)}
            >
              全部
            </Button>
            {boardChildren.map((child) => (
              <Button
                key={child.id}
                variant={selectedChildId === child.id ? "default" : "ghost"}
                size="sm"
                className={`rounded-full ${
                  selectedChildId === child.id
                    ? "text-white"
                    : "text-muted-foreground"
                }`}
                onClick={() => setSelectedChildId(child.id)}
              >
                {child.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* 帖子列表 */}
      <div className="mx-auto w-full">
        <div className="space-y-4 py-4">
          {discussionsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : discussions.length === 0 ? (
            <div className="flex justify-center py-8 text-muted-foreground">
              這裡空空如也
            </div>
          ) : (
            discussions.map((discussion) => (
              <div key={discussion.first_post_id} className="py-4">
                <div className="flex items-start space-x-3">
                  <Avatar className="h-10 w-10 rounded-lg">
                    <AvatarImage src={discussion.user.avatar_url} />
                    <AvatarFallback>
                      {discussion.user.username[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/discussions/${discussion.slug}`}
                            className="text-lg font-medium hover:text-primary"
                          >
                            {discussion.title}
                          </Link>
                          {discussion.is_private === 1 && (
                            <Badge variant="secondary">私密</Badge>
                          )}
                          {discussion.is_sticky === 1 && (
                            <Badge
                              variant="secondary"
                              className="bg-blue-50 text-blue-600"
                            >
                              置顶
                            </Badge>
                          )}
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <p className="mt-1 text-md text-muted-foreground line-clamp-2">
                        {discussion.main_post.content}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center space-x-4 text-xs">
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <Heart className="h-4 w-4" />
                        <span>{discussion.votes}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <MessageSquare className="h-4 w-4" />
                        <span>{discussion.comment_count}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <span>{discussion.diff_humans}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <span>来自 {discussion.board.name}</span>{" "}
                        <span>#{discussion.board_child.name}</span>
                      </div>
                    </div>
                    {/* <div className="mt-3 flex items-center space-x-4">
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <Heart className="h-4 w-4" />
                        <span className="text-sm">{discussion.votes}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <MessageSquare className="h-4 w-4" />
                        <span className="text-sm">
                          {discussion.comment_count}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <span className="text-sm">
                          {discussion.diff_humans}
                        </span>
                      </div>
                    </div> */}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {!discussionsLoading && currentPage < totalPages && (
          <div className="flex justify-center py-8">
            <Button
              variant="outline"
              onClick={handleLoadMore}
              className="w-[200px]"
            >
              加載更多
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
