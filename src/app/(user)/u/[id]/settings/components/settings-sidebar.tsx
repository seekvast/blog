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
  | "violation";

interface SettingsSidebarProps {
  activeTab: SettingsTabType;
}

interface NavGroup {
  title: string;
  icon: React.ElementType;
  items: {
    label: string;
    href: SettingsTabType;
  }[];
}

const navGroups: NavGroup[] = [
  {
    title: "个人资讯",
    icon: User,
    items: [
      {
        label: "个人档案",
        href: "profile",
      },
    ],
  },
  {
    title: "帐号安全",
    icon: Shield,
    items: [
      {
        label: "电子邮件",
        href: "security",
      },
    ],
  },
  {
    title: "通知",
    icon: Bell,
    items: [
      {
        label: "自动通注",
        href: "notification",
      },
    ],
  },
  {
    title: "外观",
    icon: Palette,
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
    items: [
      {
        label: "检举记录",
        href: "violation",
      },
    ],
  },
  {
    title: "语言",
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
    icon: FileText,
    items: [
      {
        label: "服务条款",
        href: "policy",
      },
    ],
  },
];

export default function SettingsSidebar({ activeTab }: SettingsSidebarProps) {
  return (
    <nav className="rounded-lg divide-y divide-gray-100">
      {navGroups.map((group) => {
        const Icon = group.icon;
        return (
          <div key={group.title} className="py-2">
            <div className="px-4 py-2 flex items-center gap-2 text-sm font-medium text-gray-500">
              <Icon className="h-4 w-4" />
              <span>{group.title}</span>
            </div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = activeTab === item.href;
                return (
                  <a
                    key={item.href}
                    href={`#${item.href}`}
                    className={cn(
                      "block px-4 py-2 text-sm rounded-lg transition-colors",
                      isActive
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    {item.label}
                  </a>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
