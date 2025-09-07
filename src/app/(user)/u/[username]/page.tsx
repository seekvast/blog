import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import UserSidebar from "./components/user-sidebar";
import { UserPosts } from "./components/user-posts";
import { UserReplies } from "./components/user-replies";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/dayjs";
import { getSession } from "@/lib/auth";
import type { Post, Pagination } from "@/types";
import type { Discussion } from "@/types/discussion";
import { getDiscussionPreferences } from "@/lib/discussion-preferences-server";
import { getValidSortBy } from "@/lib/discussion-preferences";
import { SortBy, DisplayMode } from "@/types/display-preferences";

type UserTabType = "replies" | "posts" | "history";
const VALID_TABS: UserTabType[] = ["replies", "posts", "history"];

function isValidTab(tab: any): tab is UserTabType {
  return VALID_TABS.includes(tab);
}

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
    <div className="rounded-lg bg-card p-4">
      <h3 className="lg:pb-3 text-md font-semibold border-b">使用者名称历史</h3>
      <ul className="space-y-2 mt-4">
        {usernameHistory.map((username, index) => (
          <li
            key={index}
            className="p-3 flex items-center justify-between lg:w-1/2 text-sm text-muted-foreground bg-muted rounded-lg"
          >
            <span>{Object.keys(username)[0]}</span>
            <span className="text-right">
              {formatDate(Object.values(username)[0] * 1000, "YYYY-MM-DD")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function UserPage({
  params,
  searchParams,
}: {
  params: { username: string };
  searchParams: { tab?: string; sort?: SortBy };
}) {
  const { username } = params;
  const activeTab = isValidTab(searchParams.tab) ? searchParams.tab : "replies";
  const session = await getSession();

  const userData = await api.users.get({ username });

  if (!userData) {
    notFound();
  }

  const isOwner = session?.user?.hashid === userData.hashid;
  const prefsFromCookie = getDiscussionPreferences();
  const sortFromUrl = searchParams?.sort;
  const sortBy = getValidSortBy(sortFromUrl ?? prefsFromCookie.sort);

  const renderContent = async () => {
    switch (activeTab) {
      case "posts":
        const initialPosts = await api.discussions.list({ username, page: 1 });
        return (
          <UserPosts
            initialPosts={initialPosts as Pagination<Discussion>}
            username={username}
            sortBy={sortBy}
          />
        );

      case "replies":
        const initialReplies = await api.users.getPosts({
          username,
          page: 1,
        });
        return (
          <UserReplies
            initialReplies={initialReplies as Pagination<Post>}
            username={username}
          />
        );

      case "history":
        return isOwner ? (
          <UsernameHistory usernameHistory={userData.username_history} />
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="lg:py-4">
      <div className="flex flex-col lg:flex-row min-h-screen gap-4 lg:gap-8">
        <div className="lg:w-60 flex-shrink-0">
          <UserSidebar
            username={username}
            activeTab={activeTab}
            isOwner={isOwner}
            stats={{
              replies: userData.replies_count ?? 0,
              posts: userData.discussion_count ?? 0,
            }}
          />
        </div>
        <div className="flex-1 min-w-0 overflow-hidden">
          <Suspense fallback={<Skeleton className="h-96 w-full rounded-lg" />}>
            {renderContent()}
          </Suspense>
        </div>
      </div>
    </div>
  );
}
