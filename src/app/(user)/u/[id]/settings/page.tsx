"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import SettingsSidebar, {
  SettingsTabType,
  navGroups,
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, ChevronLeft } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const params = useSearchParams();
  const userId = params?.get("hashid");
  const [activeTab, setActiveTab] = React.useState<SettingsTabType>("profile");
  const [blacklistType, setBlacklistType] = React.useState<"board" | "user">(
    "user"
  );
  const [showViolation, setShowViolation] = React.useState<boolean>(false);
  const [violationType, setViolationType] = React.useState<string>("account");

  const sectionRefs = {
    profile: useRef<HTMLElement>(null),
    security: useRef<HTMLElement>(null),
    notification: useRef<HTMLElement>(null),
    theme: useRef<HTMLElement>(null),
    privacy: useRef<HTMLElement>(null),
    language: useRef<HTMLElement>(null),
    policy: useRef<HTMLElement>(null),
    blacklist: useRef<HTMLElement>(null),
    violation: useRef<HTMLElement>(null),
  };

  const { data: user, isLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => api.users.get({ hashid: userId }),
    enabled: !!userId,
  });

  const handleUpdatePreference = (value: string) => {
    api.users.savePreferences({
      preferences: {
        discloseOnline: value,
      },
      hashid: userId,
    });
    //更新user缓存
    queryClient.setQueryData<User>(["user", userId], (user) => {
      if (!user) return user;
      return {
        ...user,
        preferences: {
          ...user.preferences,
          discloseOnline: value,
          nsfwVisible: user.preferences?.nsfwVisible || "no",
          autoFollow: user.preferences?.autoFollow || "yes",
          notify_voted: user.preferences?.notify_voted || "yes",
          notify_reply: user.preferences?.notify_reply || "yes",
          notify_newPost: user.preferences?.notify_newPost || "yes",
          notify_userMentioned: user.preferences?.notify_userMentioned || "yes",
          notify_discussionLocked:
            user.preferences?.notify_discussionLocked || "yes",
          notify_report: user.preferences?.notify_report || "yes",
        },
      };
    });
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) as SettingsTabType;
      if (hash) {
        setActiveTab(hash);

        if (!getMenuOpenTabStatus(hash) && sectionRefs[hash]?.current) {
          if (hash === "profile") {
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          } else {
            sectionRefs[hash].current?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }
      }
    };

    if (window.location.hash) {
      setTimeout(handleHashChange, 100);
    } else {
      window.history.pushState(null, "", "#profile");
      setActiveTab("profile");
    }

    // 监听hash变化
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // 处理 Tab 切换
  const handleTabChange = (tab: SettingsTabType) => {
    setActiveTab(tab);

    window.history.pushState(null, "", `#${tab}`);
    if (!getMenuOpenTabStatus(tab) && sectionRefs[tab]?.current) {
      if (tab === "profile") {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      } else {
        sectionRefs[tab].current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "blacklist":
        return (
          <section className="pt-4 lg:px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center justify-between">
                <ChevronLeft
                  className="mr-2 h-5 w-5 cursor-pointer"
                  onClick={() => setActiveTab("")}
                />
                <h2 className="text-xl font-semibold">封锁列表</h2>
              </div>
              {/* <Select
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
              </Select> */}
            </div>
            <UserBlacklist
              type={blacklistType}
              onTypeChange={setBlacklistType}
            />
          </section>
        );
      case "violation":
        return (
          <section className="pt-4 lg:px-4">
            <div className="flex items-center">
              <ChevronLeft
                className="mr-2 h-5 w-5 cursor-pointer"
                onClick={() => setActiveTab("")}
              />
              <h2 className="text-xl font-semibold">检举记录</h2>
            </div>
            <ViolationRecords violationType={violationType} />
          </section>
        );
      default:
        return null;
    }
  };

  const getMenuOpenTabStatus = (tab: SettingsTabType): boolean => {
    const navGroup = navGroups.find((group) => group.href === tab);
    return !!navGroup?.openTab;
  };

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

  const handleShowViolation = (tab: string) => {
    setShowViolation(true);
    setViolationType(tab);
  };
  const renderViolation = () => {
    if (!showViolation) return null;

    return (
      <section className="pt-4 lg:px-4">
        <div className="flex items-center">
          <ChevronLeft
            className="mr-2 h-5 w-5 cursor-pointer"
            onClick={() => setShowViolation(false)}
          />
          <h2 className="text-xl font-semibold">
            {violationType === "account" ? "账号状态" : "活动状态"}
          </h2>
        </div>
        <ViolationRecords violationType={violationType} />
      </section>
    );
  };
  return (
    <div className="px-4 lg:py-4 lg:px-0">
      <div className="flex gap-8 relative">
        {/* 左侧导航 */}
        <div className="hidden lg:block w-60 flex-shrink-0">
          <div className="fixed w-60">
            <SettingsSidebar
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          </div>
        </div>

        {/* 右侧内容区 */}
        <div className="flex-1">
          {/* 当 showViolation 为 true 时只渲染违规记录内容 */}
          {showViolation ? (
            renderViolation()
          ) : (
            <>
              {/* 使用 Tab 切换的内容 */}
              {getMenuOpenTabStatus(activeTab) && renderTabContent()}

              {/* 使用锚点跳转的内容 - 只显示没有 openTab 属性的菜单项 */}
              {!getMenuOpenTabStatus(activeTab) && (
                <>
                  <section
                    ref={sectionRefs.profile}
                    id="profile"
                    className="py-3"
                  >
                    <h2 className="text-xl font-semibold">个人资讯</h2>
                    <ProfileSettings user={user} />
                  </section>

                  <section
                    ref={sectionRefs.security}
                    id="security"
                    className="py-2 [scroll-margin-top:80px]"
                  >
                    <h2 className="text-xl font-semibold">帳號安全</h2>
                    <SecuritySettings user={user} />
                  </section>

                  <section
                    ref={sectionRefs.notification}
                    id="notification"
                    className="py-2 [scroll-margin-top:80px]"
                  >
                    <h2 className="text-xl font-semibold">通知</h2>
                    <NotificationSettings user={user} />
                  </section>

                  <section
                    ref={sectionRefs.theme}
                    id="theme"
                    className="py-2 [scroll-margin-top:80px] border-b"
                  >
                    <h2 className="text-xl font-semibold">外观</h2>
                    <ThemeSettings />
                  </section>

                  <section
                    ref={sectionRefs.privacy}
                    id="privacy"
                    className="py-2 [scroll-margin-top:80px]"
                  >
                    <h2 className="text-xl font-semibold">隐私</h2>
                    <div className="py-3 border-b">
                      <Label>上線狀態顯示</Label>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm text-gray-500 mt-1">
                          顯示或隱藏你的線上狀態，讓其他使用者知道你是否在線。
                        </p>
                        <Switch
                          checked={user?.preferences?.discloseOnline === "yes"}
                          onCheckedChange={(checked) =>
                            handleUpdatePreference(checked ? "yes" : "no")
                          }
                        />
                      </div>
                    </div>
                  </section>

                  <section className="lg:hidden flex justify-between items-center py-4 border-b">
                    <button
                      className="w-full flex justify-between items-center text-left"
                      onClick={() => handleTabChange("blacklist")}
                    >
                      <h2 className="text-xl font-semibold">黑名单</h2>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </button>
                  </section>

                  <section
                    ref={sectionRefs.violation}
                    id="violation"
                    className="py-2 [scroll-margin-top:80px]"
                  >
                    <h2 className="text-xl font-semibold">违规</h2>
                    <div className="space-y-6">
                      <div
                        className="py-3 border-b cursor-pointer"
                        onClick={() => handleShowViolation("account")}
                      >
                        <Label>账号状态</Label>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm text-gray-500 mt-1">
                            当你的文章被删除，账号被停用或发送其他重大变更时，相关通知在此显示。
                          </p>
                          <div
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => handleShowViolation("account")}
                          >
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                      <div
                        className="py-3 border-b cursor-pointer"
                        onClick={() => handleShowViolation("board")}
                      >
                        <Label>活动状态</Label>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm text-gray-500 mt-1">
                            接收看板管理员对文章，权限及其他管理操作的相关通知将在此显示。
                          </p>
                          <div
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => handleShowViolation("board")}
                          >
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section
                    ref={sectionRefs.language}
                    id="language"
                    className="py-4 [scroll-margin-top:80px] border-b"
                  >
                    <div className="flex items-center justify-between ">
                      <h2 className="text-xl font-semibold">语言设置</h2>
                      <LanguageSettings />
                    </div>
                  </section>

                  <section
                    ref={sectionRefs.policy}
                    id="policy"
                    className="py-4 [scroll-margin-top:80px]"
                  >
                    <h2 className="text-xl font-semibold mb-4">网站政策</h2>
                    <PolicySettings />
                  </section>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
