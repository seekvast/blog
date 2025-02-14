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
    label: "违规记录",
    count: 41,
    href: "violation" as UserTabType,
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
  console.log(userId, "usr........id");
  const [activeTab, setActiveTab] = React.useState<UserTabType>("posts");

  const mockPosts = [
    {
      id: "1",
      title: "那些喜歡小女生的根本人渣===",
      content:
        "那些喜歡小女生的根本人渣===,rt那些喜歡小女生的根本人渣===,rt那些喜歡小女生的根本人渣===,rt",
      date: "今天14:15",
      commentCount: 123,
      likeCount: 123,
      author: {
        name: "用户名",
        avatar: "/avatar.jpg",
      },
      board: {
        name: "看板名称",
        icon: "/board-icon.jpg",
      },
      isNsfw: true,
    },
    {
      id: "2",
      title: "那些喜歡小女生的根本人渣===",
      content:
        "想弄個手照集中串 大家願意分享自己的手照嗎想弄個手照集中串 大家願意分享自己的手照嗎想弄個手照集中串 大家願意分享自己的手照嗎",
      date: "今天14:15",
      commentCount: 123,
      likeCount: 123,
      author: {
        name: "用户名",
        avatar: "/avatar.jpg",
      },
      board: {
        name: "看板名称",
        icon: "/board-icon.jpg",
      },
    },
  ];

  // 根据activeTab渲染对应的内容
  const renderContent = () => {
    switch (activeTab) {
      case "posts":
        return <UserPosts posts={mockPosts} />;
      case "replies":
        return <UserReplies />;
      case "following":
        return <div>帖子内容</div>;
      case "violation":
        return <div>违规记录内容</div>;
      case "history":
        return <div>使用者名称历史内容</div>;
      default:
        return null;
    }
  };

  return (
    <div className="py-4">
      <div className="flex gap-8">
        {/* 左侧导航 */}
        <div className="w-60 flex-shrink-0">
          <UserSidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            navItems={navItems}
          />
        </div>

        {/* 右侧内容区 */}
        <div className="flex-1">{renderContent()}</div>
      </div>
    </div>
  );
}
