"use client";

import * as React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Suspense } from "react";
import { api } from "@/lib/api";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Board, BoardChild, BoardRule } from "@/types/board";
import { Discussion } from "@/types/discussion";
import { DiscussionItem } from "@/components/discussion/discussion-item";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";
import { BoardUserRole } from "@/constants/board-user-role";
import { useQuery } from "@tanstack/react-query";
import { BoardApprovalMode } from "@/constants/board-approval-mode";
import { DiscussionControls } from "@/components/discussion/discussion-controls";
import { DisplayMode, SortBy } from "@/types/display-preferences";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { JoinBoardDialog } from "@/components/board/join-board-dialog";
import { useDiscussionDisplayStore } from "@/store/discussion-display-store";

export default function BoardPage() {
  return (
    <ErrorBoundary>
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
  const queryClient = useQueryClient();
  const params = useParams();
  const searchParams = useSearchParams();
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
  const { displayMode, sortBy, setSortBy } = useDiscussionDisplayStore();
  const [activeTab, setActiveTab] = useState<"posts" | "rules" | "children">(
    "posts"
  );
  const [joinBoardOpen, setJoinBoardOpen] = useState(false);

  const handleLoadMore = useCallback(() => {
    if (!discussionsLoading && hasMore) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [discussionsLoading, hasMore]);

  const handleChangeDiscussion = (slug: string) => {
    setDiscussions((prev) =>
      prev.filter((discussion) => discussion.slug !== slug)
    );
    fetchDiscussions();
  };

  const fetchBoardDetail = async () => {
    try {
      setLoading(true);
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
    } catch (error) {
      setError("获取子板块失败");
    }
  };

  const fetchDiscussions = async (sort: SortBy = sortBy) => {
    try {
      setDiscussionsLoading(true);
      if (!board?.id) return;

      const data = await api.discussions.list({
        board_id: board.id,
        board_child_id: selectedChildId || undefined,
        page: currentPage,
        per_page: 10,
        from: "board",
        sort,
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
      fetchBoardChildren().then(() => {
        const childParam = searchParams?.get("child");
        if (childParam) {
          const childId = parseInt(childParam, 10);
          if (!isNaN(childId)) {
            setSelectedChildId(childId);
          }
        }
      });
    }
  }, [board?.id, searchParams]);

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

  // 添加对sortBy变化的监听
  useEffect(() => {
    if (board?.id && activeTab === "posts") {
      setCurrentPage(1);
      setDiscussions([]);
      fetchDiscussions();
    }
  }, [sortBy]);

  const {
    data: rules = [],
    isLoading: rulesLoading,
    isError: rulesError,
  } = useQuery<BoardRule[]>({
    queryKey: ["board-rules", board?.id],
    queryFn: () => {
      if (!board?.id) return [];
      return api.boards.getRules({ board_id: board.id });
    },
    enabled: !!board?.id && activeTab === "rules",
    staleTime: 5 * 60 * 1000,
  });

  const { mutate: joinBoard } = useMutation({
    mutationFn: (boardId: number) => api.boards.join({ board_id: boardId }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["board_detail"] });
      fetchBoardDetail();
      toast({
        title: "加入看板成功",
      });
    },
  });

  const { mutate: hideChild } = useMutation({
    mutationFn: (child_id: number) =>
      api.boards.hiddenChild({ child_id, operator: "user" }),
    onSuccess: () => {
      fetchBoardChildren();
      toast({
        title: "操作成功",
      });
    },
    onError: () => {
      toast({
        title: "操作失败",
        variant: "destructive",
      });
    },
  });

  const handleHide = (child: BoardChild) => {
    if (!board?.id) return;

    hideChild(child.id);
  };

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
        看板不存在
      </div>
    );
  }
  const handleJoinBoard = () => {
    if (board.approval_mode === BoardApprovalMode.APPROVAL) {
      setJoinBoardOpen(true);
    } else {
      joinBoard(board.id);
    }
  };
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
                      <>
                        <Link href={`/b/${board.slug}/settings`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="space-x-1 text-primary rounded-full"
                          >
                            设定
                          </Button>
                        </Link>
                      </>
                    )}
                  {board.board_user ? (
                    <Button
                      size="sm"
                      className="space-x-1 rounded-full"
                      variant="outline"
                    >
                      已加入
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="space-x-1 rounded-full"
                      onClick={handleJoinBoard}
                    >
                      加入
                    </Button>
                  )}
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
                    className={`h-8 font-medium ${
                      activeTab === "posts"
                        ? "text-primary hover:bg-transparent hover:text-primary"
                        : "text-muted-foreground hover:bg-transparent hover:text-foreground"
                    }`}
                    onClick={() => setActiveTab("posts")}
                  >
                    文章
                  </button>
                  <button
                    type="button"
                    className={`h-8 font-medium ${
                      activeTab === "rules"
                        ? "text-primary hover:bg-transparent hover:text-primary"
                        : "text-muted-foreground hover:bg-transparent hover:text-foreground"
                    }`}
                    onClick={() => setActiveTab("rules")}
                  >
                    规则
                  </button>
                  <button
                    type="button"
                    className={`h-8 font-medium ${
                      activeTab === "children"
                        ? "text-primary hover:bg-transparent hover:text-primary"
                        : "text-muted-foreground hover:bg-transparent hover:text-foreground"
                    }`}
                    onClick={() => setActiveTab("children")}
                  >
                    子版
                  </button>
                </div>
                {activeTab === "posts" && <DiscussionControls />}
              </div>
            </div>
          </div>

          {/* 子导航 */}
          <div className="flex items-center space-x-4 py-3 text-sm">
            {activeTab === "posts" && (
              <>
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
                    variant={
                      selectedChildId === child.id ? "default" : "secondary"
                    }
                    className={`cursor-pointer hover:bg-primary/90 ${
                      selectedChildId === child.id
                        ? ""
                        : "hover:bg-secondary/80"
                    }`}
                    onClick={() => setSelectedChildId(child.id)}
                  >
                    {child.name}
                  </Badge>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* 帖子列表或规则列表 */}
      <div className="mx-auto w-full">
        {activeTab === "posts" && (
          <>
            <InfiniteScroll
              loading={discussionsLoading}
              hasMore={hasMore}
              onLoadMore={handleLoadMore}
              className="space-y-4 py-4 divide-y"
            >
              {discussions.map((discussion) => (
                <DiscussionItem
                  key={discussion.first_post_id}
                  discussion={discussion}
                  displayMode={displayMode}
                  onChange={handleChangeDiscussion}
                />
              ))}
            </InfiniteScroll>
            {/* 4. 添加加载状态指示器 */}
            <div className="h-10 flex items-center justify-center text-muted-foreground">
              {!hasMore && totalPages > 1 && <div>No more items</div>}
            </div>
          </>
        )}

        {activeTab === "rules" && (
          <div className="py-4">
            {rulesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : rulesError ? (
              <div className="text-center py-8 text-red-500">
                获取规则列表失败，请重试
              </div>
            ) : rules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                暂无规则
              </div>
            ) : (
              <div className="space-y-6">
                {rules.map((rule, index) => (
                  <div key={rule.id || index} className="border-b pb-4">
                    <h3 className="text-lg font-medium mb-2">{rule.title}</h3>
                    <p className="text-muted-foreground">{rule.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "children" && (
          <div className="py-4">
            {boardChildren.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                暂无子版块
              </div>
            ) : (
              <div className="space-y-6">
                {boardChildren.map((child) => (
                  <div key={child.id} className="border-b pb-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium mb-2">{child.name}</h3>
                      <button
                        className="text-xs px-2 py-1 rounded-full bg-gray-100"
                        onClick={() => handleHide(child)}
                      >
                        {child.user_hidden === 1 ? "取消隐藏" : "隐藏"}
                      </button>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {child.id} 篇文章
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {/* 加入看板对话框 */}
      {board && (
        <JoinBoardDialog
          open={joinBoardOpen}
          onOpenChange={setJoinBoardOpen}
          boardId={board.id}
          question={board.question}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["recommend-boards"] });
          }}
        />
      )}
    </div>
  );
}
