"use client";

import { useParams } from "next/navigation";
import React from "react";
import UserSidebar, { UserTabType } from "./components/user-sidebar";
import { UserPosts } from "./components/user-posts";
import { UserReplies } from "./components/user-replies";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

const navItems = [
  {
    label: "回复",
    count: 22,
    href: "replies" as UserTabType,
  },
  {
    label: "文章",
    count: 45,
    href: "posts" as UserTabType,
  },
  {
    label: "标注",
    count: 46,
    href: "following" as UserTabType,
  },
  {
    label: "使用者名称历史",
    count: 41,
    href: "history" as UserTabType,
  },
];

// 用户名历史列表组件
function UsernameHistory({ usernameHistory }: { usernameHistory?: string[] }) {
  if (!usernameHistory || usernameHistory.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground bg-card rounded-lg">
        暂无用户名修改历史
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-card">
      <div className="px-4 border-b">
        <h3 className="lg:pb-3 text-md font-semibold">使用者名称历史</h3>
      </div>
      <ul className="divide-y">
        {usernameHistory.map((username, index) => (
          <li key={index} className="p-4 flex items-center justify-between">
            <div className="flex items-center">
              <span className="font-medium">{username}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// 加载状态组件
function UsernameHistorySkeleton() {
  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <div className="p-4 border-b">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>
      <div className="divide-y">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="p-4 flex items-center justify-between">
            <div className="flex items-center">
              <Skeleton className="h-8 w-8 rounded-full mr-3" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-4 w-8" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function UserPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const userId = params?.id as string;
  const hashid = searchParams?.get("hashid");
  const [activeTab, setActiveTab] = React.useState<UserTabType>("replies");

  const { data: userData, isLoading } = useQuery({
    queryKey: ["user", hashid],
    queryFn: () => api.users.get({ hashid: hashid }),
    enabled: !!hashid,
  });

  const renderContent = () => {
    switch (activeTab) {
      case "posts":
        return <UserPosts />;
      case "replies":
        return <UserReplies />;
      case "following":
        return <div className="min-h-screen"></div>;
      case "history":
        return (
          <div className="min-h-screen">
            {isLoading ? (
              <UsernameHistorySkeleton />
            ) : (
              <UsernameHistory usernameHistory={userData?.username_history} />
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="lg:py-4">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
        {/* 左侧导航 */}
        <div className="lg:w-60 flex-shrink-0">
          <UserSidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            navItems={navItems}
          />
        </div>

        {/* 右侧内容区 */}
        <div className="flex-1 min-w-0 overflow-hidden">{renderContent()}</div>
      </div>
    </div>
  );
}
