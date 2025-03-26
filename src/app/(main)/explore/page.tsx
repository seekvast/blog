"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { DiscussionItem } from "@/components/home/discussion-item";
import { BoardItem } from "@/components/board/board-item";
import { UserItem } from "@/components/user/user-item";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "all", name: "相关" },
  { id: "discussion", name: "文章" },
  { id: "board", name: "看板" },
  { id: "user", name: "用户" },
] as const;

export default function ExplorePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams?.get("q") ?? "";
  const [activeTab, setActiveTab] = React.useState<string>("all");
  const { data: explore } = useQuery({
    queryKey: ["explore", q],
    queryFn: () => api.common.search({ q }),
    enabled: !!q,
  });

  if (!q) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground">
        请输入搜索关键词
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-8 pb-8">
      {/* Tab 导航 */}
      <div className="flex space-x-4 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.id === "all") {
                router.push(`/explore?q=${q}`);
              } else {
                router.push(`/explore/${tab.id}s?q=${q}`);
              }
            }}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* 文章区块 */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium border-l-4 border-primary pl-2">
            文章
          </h2>
          <Link
            href={{ pathname: "/explore/discussions", query: { q } }}
            className="text-sm text-primary hover:text-primary/90"
          >
            全部结果
          </Link>
        </div>
        <div className="divide-y">
          {explore?.discussions.items.map((discussion, index) => {
            return (
              <DiscussionItem
                key={discussion.slug}
                discussion={discussion}
                displayMode="list"
              />
            );
          })}
        </div>
      </section>

      {/* 看板区块 */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium border-l-4 border-primary pl-2">
            看板
          </h2>
          <Link
            href={{ pathname: "/explore/boards", query: { q } }}
            className="text-sm text-primary hover:text-primary/90"
          >
            全部结果
          </Link>
        </div>
        {explore?.boards.items.map((board) => (
          <BoardItem key={board.id} board={board} />
        ))}
      </section>

      {/* 用户区块 */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium border-l-4 border-primary pl-2">
            用户
          </h2>
          <Link
            href={{ pathname: "/explore/users", query: { q } }}
            className="text-sm text-primary hover:text-primary/90"
          >
            全部结果
          </Link>
        </div>
        {explore?.users.items.map((user, index) => (
          <UserItem key={user.hashid + index} user={user} />
        ))}
      </section>
    </div>
  );
}
