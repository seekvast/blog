"use client";

import * as React from "react";
import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { Board, BoardChild, BoardRule, Pagination } from "@/types";
import { Discussion } from "@/types/discussion";
import { DiscussionItem } from "@/components/discussion/discussion-item";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";
import { BoardActionButton } from "@/components/board/board-action-button";
import { DiscussionControls } from "@/components/discussion/discussion-controls";
import { SortBy, DisplayMode } from "@/types/display-preferences";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { useDiscussionDisplayStore } from "@/store/discussion-display-store";
import { cn } from "@/lib/utils";
import { ReportDialog } from "@/components/report/report-dialog";
import { ReportTarget } from "@/constants/report-target";

interface BoardDetailProps {
  initialBoard: Board;
  initialDiscussions: Pagination<Discussion> | null;
  initialRules: BoardRule[] | null;
  initialChildren: BoardChild[];
  activeTab: string;
  selectedChildId: number | null;
  sortBy: SortBy;
  initDisplayMode: DisplayMode;
  pageId: string;
}

export function BoardDetail({
  initialBoard,
  initialDiscussions,
  initialRules,
  initialChildren,
  activeTab,
  selectedChildId,
  sortBy,
  initDisplayMode,
  pageId,
}: BoardDetailProps) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const [board] = useState(initialBoard);
  const [discussions, setDiscussions] = useState(
    initialDiscussions?.items ?? []
  );
  const [currentPage, setCurrentPage] = useState(
    initialDiscussions?.current_page ?? 1
  );
  const [hasMore, setHasMore] = useState(
    (initialDiscussions?.current_page ?? 1) <
      (initialDiscussions?.last_page ?? 1)
  );
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [reportToKaterOpen, setReportToKaterOpen] = useState(false);

  const { getDisplayMode, setDisplayMode } = useDiscussionDisplayStore();

  useEffect(() => {
    setDisplayMode(initDisplayMode, pageId);
  }, [initDisplayMode, pageId, setDisplayMode]);

  const displayMode = getDisplayMode(pageId, initDisplayMode);

  useEffect(() => {
    setDiscussions(initialDiscussions?.items ?? []);
    setCurrentPage(initialDiscussions?.current_page ?? 1);
    setHasMore(
      (initialDiscussions?.current_page ?? 1) <
        (initialDiscussions?.last_page ?? 1)
    );
  }, [initialDiscussions, sortBy, selectedChildId]);

  const loadMoreDiscussions = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const data = await api.discussions.list({
        board_id: board.id,
        board_child_id: selectedChildId || undefined,
        page: nextPage,
        per_page: 10,
        from: "board",
        sort: sortBy,
      });
      setDiscussions((prev) => [...prev, ...data.items]);
      setCurrentPage(nextPage);
      setHasMore(nextPage < data.last_page);
    } catch (error) {
      console.error("Failed to load more discussions:", error);
      toast({ title: "加载更多失败", variant: "destructive" });
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, currentPage, board.id, selectedChildId, sortBy]);

  const { mutate: hideChild } = useMutation({
    mutationFn: (child_id: number) =>
      api.boards.hiddenChild({ child_id, operator: "user" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boardChildren", board.id] });
      toast({ title: "操作成功" });
    },
    onError: () => toast({ title: "操作失败", variant: "destructive" }),
  });

  const createUrl = (newParams: Record<string, string | number | null>) => {
    if (pathname === null) {
      return "#";
    }

    const params = new URLSearchParams();
    if (sortBy !== "hot") params.set("sort", sortBy);

    const currentChildId =
      newParams.child !== undefined ? newParams.child : selectedChildId;
    if (currentChildId) {
      params.set("child", String(currentChildId));
    }

    const currentTab = newParams.tab !== undefined ? newParams.tab : activeTab;
    if (currentTab && currentTab !== "posts") {
      params.set("tab", String(currentTab));
    }

    for (const [key, value] of Object.entries(newParams)) {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    }

    const queryString = params.toString();
    return queryString ? `${pathname}?${queryString}` : pathname;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto] gap-4 md:gap-6">
      <div className="min-w-0">
        {/* 看板信息头 */}
        <div className="flex flex-col bg-background max-w-4xl">
          <div className="flex items-start space-x-3 pb-4">
            <Avatar className="h-14 w-14">
              <AvatarImage src={board.avatar} alt={board.name} />
              <AvatarFallback>{board.name[0].toUpperCase()}</AvatarFallback>
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
                </div>
                <div className="flex items-center space-x-4">
                  <BoardActionButton
                    board={board}
                    setReportToKaterOpen={setReportToKaterOpen}
                    onBlockSuccess={() => router.back()}
                  />
                </div>
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>{board.visibility >= 1 ? "私密" : "公開"}</span>
                  <span>•</span>
                  <div className="flex items-center">
                    <UserRound className="h-4" />
                    <span>{board.users_count || 0}</span>
                  </div>
                  {board.category && (
                    <>
                      <span>•</span>
                      <span>{board.category.name}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {board.desc}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-background">
          <div className="mx-auto">
            <div className="flex h-[40px] items-center justify-between px-4 border-b">
              <div className="flex items-center space-x-4 lg:space-x-8">
                {["posts", "rules", "children"].map((tab) => (
                  <Link
                    key={tab}
                    href={createUrl({
                      tab: tab === "posts" ? null : tab,
                      child: null,
                    })}
                    className={cn(
                      "relative px-2 py-1 transition-colors duration-150",
                      activeTab === tab
                        ? "text-primary font-bold"
                        : "text-muted-foreground font-normal"
                    )}
                  >
                    {tab === "posts"
                      ? "文章"
                      : tab === "rules"
                      ? "规则"
                      : "子版"}
                    {activeTab === tab && (
                      <span className="absolute left-0 right-0 -bottom-1 h-[3px] rounded bg-primary" />
                    )}
                  </Link>
                ))}
              </div>
              {activeTab === "posts" && (
                <DiscussionControls
                  sortBy={sortBy}
                  pageId={pageId}
                  displayMode={displayMode}
                />
              )}
            </div>
          </div>
        </div>

        {/* 子导航 */}
        {activeTab === "posts" && (
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 px-4 pt-3 text-sm">
            <Link href={createUrl({ child: null })}>
              <Badge
                variant={!selectedChildId ? "default" : "secondary"}
                className="cursor-pointer"
              >
                全部
              </Badge>
            </Link>
            {initialChildren.map((child) => (
              <Link key={child.id} href={createUrl({ child: child.id })}>
                <Badge
                  variant={
                    selectedChildId === child.id ? "default" : "secondary"
                  }
                  className="cursor-pointer"
                >
                  {child.name}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {/* 内容区域 */}
        <div className="mx-auto w-full">
          {activeTab === "posts" && (
            <InfiniteScroll
              loading={isLoadingMore}
              hasMore={hasMore}
              onLoadMore={loadMoreDiscussions}
              className="py-4 divide-y"
            >
              {discussions.map((discussion) => (
                <div key={discussion.slug} className="px-4">
                  <DiscussionItem
                    discussion={discussion}
                    displayMode={displayMode}
                    onChange={() =>
                      queryClient.invalidateQueries({
                        queryKey: ["discussions"],
                      })
                    }
                  />
                </div>
              ))}
              {isLoadingMore && (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              )}
            </InfiniteScroll>
          )}
          {activeTab === "rules" && (
            <div className="divide-y">
              {initialRules?.map((rule, index) => (
                <div key={rule.id || index} className="p-4">
                  <h3 className="text-lg font-medium mb-2">{rule.title}</h3>
                  <p className="text-muted-foreground">{rule.content}</p>
                </div>
              ))}
            </div>
          )}
          {activeTab === "children" && (
            <div className="divide-y">
              {initialChildren?.map((child) => (
                <div
                  key={child.id}
                  className="p-4 flex items-center justify-between"
                >
                  <div>
                    <h3 className="text-lg font-medium">{child.name}</h3>
                    <span className="text-sm text-muted-foreground">
                      {child.id} 篇文章
                    </span>
                  </div>
                  <button
                    className="text-xs px-2 py-1 rounded-full bg-secondary"
                    onClick={() => hideChild(child.id)}
                  >
                    隐藏
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 右侧边栏 */}
      <div className="hidden lg:block w-[240px] flex-shrink-0">
        <div className="sticky top-4">
          <div className="rounded-lg border bg-card shadow-sm overflow-hidden p-2">
            <img
              src="/placeholder-ad.jpg"
              alt="广告"
              className="w-full h-auto object-cover rounded"
            />
          </div>
        </div>
      </div>

      <ReportDialog
        open={reportToKaterOpen}
        onOpenChange={setReportToKaterOpen}
        title="向Kater檢舉"
        form={{
          user_hashid: board.creator_hashid,
          board_id: board.id,
          target: ReportTarget.BOARD,
          reported_to: "admin",
        }}
      />
    </div>
  );
}
