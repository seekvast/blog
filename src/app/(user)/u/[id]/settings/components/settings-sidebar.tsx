"use client";

import { cn } from "@/lib/utils";
import React from "react";
import {
  User,
  Shield,
  Bell,
  Eye,
  Users,
  Palette,
  Languages,
  FileText,
  Ban,
  UserRoundX,
} from "lucide-react";

export type SettingsTabType =
  | "profile"
  | "security"
  | "notification"
  | "privacy"
  | "blacklist"
  | "theme"
  | "language"
  | "policy"
  | "violation"
  | "";

interface SettingsSidebarProps {
  activeTab: SettingsTabType;
  onTabChange?: (tab: SettingsTabType) => void;
}

interface NavGroup {
  title: string;
  href: SettingsTabType;
  icon: React.ElementType;
  openTab?: boolean;
  externalUrl?: string;
  items: {
    label: string;
    href: SettingsTabType;
  }[];
}

export const navGroups: NavGroup[] = [
  {
    title: "个人资讯",
    icon: User,
    href: "profile",
    openTab: false,
    items: [
      {
        label: "个人资讯",
        href: "profile",
      },
    ],
  },
  {
    title: "帐号安全",
    href: "security",
    icon: Shield,
    openTab: false,
    items: [
      {
        label: "电子邮件",
        href: "security",
      },
    ],
  },
  {
    title: "通知",
    href: "notification",
    icon: Bell,
    openTab: false,
    items: [
      {
        label: "自动通注",
        href: "notification",
      },
    ],
  },
  {
    title: "外观",
    href: "theme",
    icon: Palette,
    openTab: false,
    items: [
      {
        label: "日夜模模式",
        href: "theme",
      },
    ],
  },
  {
    title: "隐私",
    icon: Eye,
    href: "privacy",
    openTab: false,
    items: [
      {
        label: "公开线上状态",
        href: "privacy",
      },
    ],
  },
  {
    title: "黑名单",
    icon: UserRoundX,
    href: "blacklist",
    openTab: true,
    items: [
      {
        label: "封锁列表",
        href: "blacklist",
      },
    ],
  },
  {
    title: "违规",
    icon: Ban,
    href: "violation",
    openTab: false,
    items: [
      {
        label: "检举记录",
        href: "violation",
      },
    ],
  },
  {
    title: "语言",
    href: "language",
    icon: Languages,
    items: [
      {
        label: "偏好语言",
        href: "language",
      },
    ],
  },
  {
    title: "网站政策",
    href: "policy",
    icon: FileText,
    openTab: false,
    externalUrl: "https://example.com/policy",
    items: [
      {
        label: "服务条款",
        href: "policy",
      },
    ],
  },
];

export default function SettingsSidebar({ activeTab, onTabChange }: SettingsSidebarProps) {
  const handleTabClick = (
    e: React.MouseEvent<HTMLElement>,
    tab: SettingsTabType,
    openTab?: boolean
  ) => {
    // 阻止所有锚点的默认行为，统一使用 onTabChange 回调
    e.preventDefault();
    onTabChange?.(tab);
  };

  return (
    <nav className="rounded-lg">
      {navGroups.map((group) => {
        const Icon = group.icon;
        return (
          <div key={group.title} className="py-2">
            <div className="text-base font-medium">
              {(() => {
                const isActive = activeTab === group.href;
                return (
                  <a
                    className={cn(
                      "flex items-center px-4 py-2 rounded-lg transition-colors",
                      isActive ? "bg-blue-subtle text-primary" : "hover:bg-subtle"
                    )}
                    key={group.href}
                    href="#"
                    onClick={(e) => handleTabClick(e, group.href, group.openTab)}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <span>{group.title}</span>
                  </a>
                );
              })()}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
