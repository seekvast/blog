"use client";

import * as React from "react";
import { useRef, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { LayoutGrid, List, ChevronDown } from "lucide-react";
import type { Discussion } from "@/types/discussion";
import type { Pagination } from "@/types/common";
import type { Board } from "@/types/board";
import type { User } from "@/types/user";
import { api } from "@/lib/api";
import { DiscussionItem } from "@/components/home/discussion-item";
import { BoardItem } from "@/components/board/board-item";
import { UserItem } from "@/components/user/user-item";
import { InfiniteScroll } from "@/components/common/infinite-scroll";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";

type DisplayMode = "list" | "grid";
type SortBy = "hot" | "create" | "reply";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function ExplorePage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams?.get("q") ?? "";
  const [activeTab, setActiveTab] = React.useState<"recommend" | "trace">(
    "recommend"
  );
  const [displayMode, setDisplayMode] = React.useState<DisplayMode>("list");

  const [discussions, setDiscussions] = React.useState<Pagination<Discussion>>({
    items: [],
    total: 0,
    per_page: 1,
    current_page: 1,
    last_page: 1,
    code: 0,
    message: "",
  });

  const [boards, setBoards] = React.useState<Pagination<Board>>({
    items: [],
    total: 0,
    per_page: 1,
    current_page: 1,
    last_page: 1,
    code: 0,
    message: "",
  });

  const [users, setUsers] = React.useState<Pagination<User>>({
    items: [],
    total: 0,
    per_page: 1,
    current_page: 1,
    last_page: 1,
    code: 0,
    message: "",
  });

  const { data: explore } = useQuery({
    queryKey: ["explore", searchQuery],
    queryFn: () => api.common.search({ q: searchQuery || "" }),
    enabled: !!searchQuery,
  });

  React.useEffect(() => {
    if (explore) {
      setDiscussions(explore.discussions);
      setBoards(explore.boards);
      setUsers(explore.users);
    }
  }, [explore]);

  return (
    <div className="flex flex-col">
      {/* 顶部导航 - 仅在非移动端显示 */}
      <div className="bg-background">
        <div className="mx-auto lg:border-b">
          <div className="flex h-[40px] items-center justify-between ">
            <div className="flex items-center space-x-8">
              <button type="button">相关</button>
              <button type="button">文章</button>
              <button type="button">看板</button>
              <button
                type="button"
                className={cn(
                  "h-8 font-medium hover:text-primary/90",
                  activeTab === "trace"
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                用户
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="divide-y">
        <section>
          <div className="flex items-center justify-between py-2">
            <h2 className="text-lg font-medium border-l-4 border-primary pl-2">
              文章
            </h2>
            <button className="text-sm text-primary">全部结果</button>
          </div>

          {discussions.items.map((discussion, index) => {
            const isLastItem = index === discussions.items.length - 1;
            return (
              <DiscussionItem
                key={discussion.slug + index}
                discussion={discussion}
                displayMode={displayMode}
                isLastItem={isLastItem}
              />
            );
          })}
        </section>
        <section className="pt-4">
          <div className="flex items-center justify-between py-2">
            <h2 className="text-lg font-medium border-l-4 border-primary pl-2">
              看板
            </h2>
            <button className="text-sm text-primary">全部结果</button>
          </div>
          {boards.items.map((board, index) => {
            return <BoardItem key={board.id} board={board} />;
          })}
        </section>
        <section className="pt-4">
          <div className="flex items-center justify-between py-2">
            <h2 className="text-lg font-medium border-l-4 border-primary pl-2">
              用户
            </h2>
            <button className="text-sm text-primary">全部结果</button>
          </div>
          {users.items.map((user, index) => {
            return <UserItem key={user.hashid + index} user={user} />;
          })}
        </section>
      </div>
    </div>
  );
}
