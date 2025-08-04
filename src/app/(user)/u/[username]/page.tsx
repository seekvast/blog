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
import { useAuth } from "@/components/providers/auth-provider";
import { formatDate } from "@/lib/dayjs";

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
    label: "使用者名称历史",
    count: 41,
    href: "history" as UserTabType,
  },
];

// 用户名历史列表组件
function UsernameHistory({
  usernameHistory,
}: {
  usernameHistory?: { [key: string]: number }[];
}) {
  if (!usernameHistory || usernameHistory.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground bg-card rounded-lg">
        暂无用户名修改历史
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-card">
      <div className="lg:border-b">
        <h3 className="lg:pb-3 text-md font-semibold">使用者名称历史</h3>
      </div>
      <ul className="space-y-2 mt-4">
        {usernameHistory.map(
          (username: { [key: string]: number }, index: number) => (
            <li
              key={index}
              className="p-3 flex items-center justify-between w-1/2 text-sm text-muted-foreground bg-muted rounded-lg"
            >
              <div>{Object.keys(username)[0]}</div>
              <div className="text-right">
                {formatDate(
                  (Object.values(username)[0] as number) * 1000,
                  "YYYY-MM-DD"
                )}
              </div>
            </li>
          )
        )}
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
  const { user } = useAuth();
  const params = useParams();
  const username = params?.username as string; // 从路径参数获取 username
  const [activeTab, setActiveTab] = React.useState<UserTabType>("replies");

  const { data: userData, isLoading } = useQuery({
    queryKey: ["user", username],
    queryFn: () => api.users.get({ username: username }),
    enabled: !!username,
  });

  const filteredNavItems = React.useMemo(() => {
    if (user && userData?.hashid === user.hashid) {
      return navItems;
    } else {
      return navItems.slice(0, -1);
    }
  }, [userData, user]);

  const renderContent = () => {
    switch (activeTab) {
      case "posts":
        return <UserPosts />;
      case "replies":
        return <UserReplies username={username || undefined} />;
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
      <div className="flex flex-col lg:flex-row min-h-screen gap-4 lg:gap-8">
        {/* 左侧导航 */}
        <div className="lg:w-60 flex-shrink-0">
          <UserSidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            navItems={filteredNavItems}
          />
        </div>

        {/* 右侧内容区 */}
        <div className="flex-1 min-w-0 overflow-hidden">{renderContent()}</div>
      </div>
    </div>
  );
}
