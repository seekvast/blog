"use client";

import React from "react";
import { useParams } from "next/navigation";
import SettingsSidebar, { SettingsTabType } from "./components/settings-sidebar";
import ProfileSettings from "./components/profile-settings"; // Add this line
import {
  User,
  Shield,
  Bell,
  Languages,
  ChevronRight,
} from "lucide-react";

const navItems = [
  {
    title: "个人资料",
    description: "更新你的个人信息，让其他用户更好地了解你",
    href: "profile",
    icon: User,
  },
  {
    title: "账号安全",
    description: "管理你的密码和账号安全设置",
    href: "account",
    icon: Shield,
  },
  {
    title: "通知设置",
    description: "自定义你想要接收的通知类型",
    href: "notification",
    icon: Bell,
  },
  {
    title: "语言设置",
    description: "选择你偏好的界面语言",
    href: "language",
    icon: Languages,
  },
];

export default function SettingsPage() {
  const params = useParams();
  const userId = params?.id as string;
  const [activeTab, setActiveTab] = React.useState<SettingsTabType>("profile");

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileSettings />;
      case "account":
        return <div>账号设置内容</div>;
      case "notification":
        return <div>通知设置内容</div>;
      case "language":
        return <div>语言设置内容</div>;
      default:
        return null;
    }
  };

  return (
    <div className="py-4">
      <div className="flex gap-8">
        {/* 左侧导航 */}
        <div className="w-60 flex-shrink-0">
          <SettingsSidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* 右侧内容区 */}
        <div className="flex-1 bg-white rounded-lg p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
