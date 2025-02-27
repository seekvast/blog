"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import SettingsSidebar, {
  SettingsTabType,
} from "./components/settings-sidebar";
import ProfileSettings from "./components/profile-settings";
import NotificationSettings from "./components/notification-settings";
import UserBlacklist from "./components/user-blacklist";
import ThemeSettings from "./components/theme-settings";
import LanguageSettings from "./components/language-settings";
import ViolationRecords from "./components/violation-records";
import PolicySettings from "./components/policy-settings";
import SecuritySettings from "./components/security-settings";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { User } from "@/types/user";
import { useQuery } from "@tanstack/react-query";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const params = useParams();
  const userId = params?.id as string;
  const [activeTab, setActiveTab] = React.useState<SettingsTabType>("profile");
  const [blacklistType, setBlacklistType] = React.useState<"board" | "user">(
    "board"
  );

  const { data: user, isLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => api.users.get({ hashid: userId }),
    enabled: !!userId,
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) as SettingsTabType;
      if (hash) {
        setActiveTab(hash);
      }
    };

    // 初始化时检查hash
    if (window.location.hash) {
      handleHashChange();
    } else {
      // 如果没有hash，设置默认hash
      window.location.hash = "profile";
    }

    // 监听hash变化
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">加载用户信息中...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">用户不存在</div>
      </div>
    );
  }

  return (
    <div className="px-4 lg:py-4 lg:px-0">
      <div className="flex gap-8 relative">
        {/* 左侧导航 */}
        <div className="hidden lg:block w-60 flex-shrink-0">
          <div className="fixed w-60">
            <SettingsSidebar activeTab={activeTab} />
          </div>
        </div>

        {/* 右侧内容区 */}
        <div className="flex-1">
          <section id="profile" className="py-3 [scroll-margin-top:60px]">
            <h2 className="text-xl font-semibold">个人资讯</h2>
            <ProfileSettings user={user} />
          </section>

          <section id="security" className="py-2 [scroll-margin-top:60px]">
            <h2 className="text-xl font-semibold">帳號安全</h2>
            <SecuritySettings user={user} />
          </section>

          <section id="notification" className="py-2 [scroll-margin-top:60px]">
            <h2 className="text-xl font-semibold">通知</h2>
            <NotificationSettings />
          </section>
          <section id="theme" className="py-2 [scroll-margin-top:60px]">
            <h2 className="text-xl font-semibold">外观</h2>
            <ThemeSettings />
          </section>
          <section id="privacy" className="py-2 [scroll-margin-top:60px]">
            <h2 className="text-xl font-semibold">上線狀態顯示</h2>
            <div className="flex items-center justify-between py-3 border-b">
              <Label className="text-sm text-gray-500">
                顯示或隱藏你的線上狀態，讓其他使用者知道你是否在線。
              </Label>
              <Switch />
            </div>
          </section>

          {/* <section id="blacklist" className="p-4 [scroll-margin-top:60px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">封锁列表</h2>
              <Select
                value={blacklistType}
                onValueChange={(value: "board" | "user") =>
                  setBlacklistType(value)
                }
              >
                <SelectTrigger className="w-32 h-8 py-1">
                  <SelectValue placeholder="选择类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="board">看板</SelectItem>
                  <SelectItem value="user">用户</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <UserBlacklist
              type={blacklistType}
              onTypeChange={setBlacklistType}
            />
          </section> */}
          {/* <section id="violation" className="p-4 [scroll-margin-top:60px]">
            <h2 className="text-xl font-semibold mb-4">检举记录</h2>
            <ViolationRecords />
          </section> */}

          <section id="language" className="py-4 [scroll-margin-top:60px]">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">语言设置</h2>
              <LanguageSettings />
            </div>
          </section>
          <section id="policy" className="py-4 [scroll-margin-top:60px]">
            <h2 className="text-xl font-semibold mb-4">网站政策</h2>
            <PolicySettings />
          </section>
        </div>
      </div>
    </div>
  );
}
