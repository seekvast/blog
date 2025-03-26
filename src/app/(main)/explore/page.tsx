"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { DiscussionItem } from "@/components/home/discussion-item";
import { BoardItem } from "@/components/board/board-item";
import { UserItem } from "@/components/user/user-item";
import { ExploreTabs } from "@/components/search/explore-tabs";

export default function ExplorePage() {
  const searchParams = useSearchParams();
  const q = searchParams?.get("q") ?? "";
  const { data: explore } = useQuery({
    queryKey: ["explore", q],
    queryFn: () => api.common.search({ keyword: q }),
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
    <div className="flex flex-col space-y-4 ">
      {/* Tab 导航 */}
      <ExploreTabs />

      {/* 文章区块 */}
      <section className="">
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
      <section className="">
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
        <div className="divide-y">
          {explore?.boards.items.map((board) => (
            <BoardItem key={board.id} board={board} />
          ))}
        </div>
      </section>

      {/* 用户区块 */}
      <section className="">
        <div className="flex items-center justify-between mb-4">
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
        <div className="grid grid-cols-2 gap-2">
          {explore?.users.items.map((user, index) => (
            <div
              key={user.hashid + index}
              className="border rounded-lg hover:border-primary transition-colors"
            >
              <UserItem user={user} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
