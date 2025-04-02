"use client";

import { useParams } from "next/navigation";
import React from "react";
import UserSidebar, { UserTabType } from "./components/user-sidebar";
import { UserPosts } from "./components/user-posts";
import { UserReplies } from "./components/user-replies";

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

export default function UserPage() {
  const params = useParams();
  const userId = params?.id as string;
  const [activeTab, setActiveTab] = React.useState<UserTabType>("replies");

  // 根据activeTab渲染对应的内容
  const renderContent = () => {
    switch (activeTab) {
      case "posts":
        return <UserPosts />;
      case "replies":
        return <UserReplies />;
      case "following":
        return <div className="min-h-screen"></div>;
      case "history":
        return <div className="min-h-screen"></div>;
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
