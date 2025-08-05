"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
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
import SettingsSection from "./components/settings-section";
import InteractiveSection from "./components/interactive-section";
import SettingsSkeleton from "./components/settings-skeleton";
import UserNotFound from "./components/user-not-found";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { User } from "@/types/user";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { api } from "@/lib/api";
import { useRequireAuth } from "@/hooks/use-require-auth";

export default function SettingsPage() {
  const { requireAuthAndEmailVerification } = useRequireAuth();
  const queryClient = useQueryClient();
  const params = useParams();
  const username = params?.username;
  const violationTypeParam = useSearchParams()?.get("violation");
  const [activeTab, setActiveTab] = React.useState<SettingsTabType>("profile");
  const [showViolation, setShowViolation] = React.useState<boolean>(false);
  const [violationType, setViolationType] = React.useState<string>("account");
  const [showBlacklist, setShowBlacklist] = React.useState<boolean>(false);
  const [blacklistType, setBlacklistType] = React.useState<string>("user");
  const [hashParam, setHashParam] = React.useState<string>("");

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
    queryKey: ["user", username],
    queryFn: () => api.users.get({ username: username }),
    enabled: !!username,
    staleTime: 1 * 60 * 1000,
    gcTime: 3 * 60 * 1000,
  });

  const handleUpdatePreference = (value: string) => {
    requireAuthAndEmailVerification(() => {
      api.users.savePreferences({
        preferences: {
          discloseOnline: value,
        },
        username: username,
      });
      //更新user缓存
      queryClient.setQueryData<User>(["user", username], (user) => {
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
            notify_userMentioned:
              user.preferences?.notify_userMentioned || "yes",
            notify_discussionLocked:
              user.preferences?.notify_discussionLocked || "yes",
            notify_report: user.preferences?.notify_report || "yes",
          },
        };
      });
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

      if (hash === "violation") {
        setShowViolation(true);
      } else {
        setShowViolation(false);
      }
    };

    if (window.location.hash) {
      setTimeout(handleHashChange, 100);
    } else {
      window.history.pushState(null, "", "#profile");
      setActiveTab("profile");
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    if (violationTypeParam) {
      setViolationType(violationTypeParam);
    }
  }, [violationTypeParam]);

  // 处理 Tab 切换
  const handleTabChange = (tab: SettingsTabType) => {
    // 重置 InteractiveSection 状态，确保关闭任何打开的详细页面
    setShowViolation(false);
    setShowBlacklist(false);
    setViolationType("account");
    setBlacklistType("user");

    setActiveTab(tab);

    window.history.pushState(null, "", `#${tab}`);
    setTimeout(() => {
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
    }, 100);
  };

  const renderTabContent = () => {
    switch (activeTab) {
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
    return <SettingsSkeleton />;
  }

  if (!user) {
    return <UserNotFound />;
  }

  const handleShowViolation = (tab: string) => {
    setShowViolation(true);
    setViolationType(tab);
  };

  const handleShowBlacklist = (type: string) => {
    setShowBlacklist(true);
    setBlacklistType(type);
  };
  const renderViolation = () => {
    if (!showViolation) return null;

    return (
      <section className="pt-4 lg:px-4">
        <div className="flex items-center">
          <ChevronLeft
            className="mr-2 h-5 w-5 cursor-pointer"
            onClick={() => {
              setShowViolation(false);
              // 更新URL hash并手动定位到违规锚点
              window.history.pushState(null, "", "#violation");
              setActiveTab("violation");
              setTimeout(() => {
                if (sectionRefs.violation?.current) {
                  sectionRefs.violation.current.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }
              }, 100);
            }}
          />
          <h2 className="text-xl font-semibold">
            {violationType === "account" ? "账号状态" : "活动状态"}
          </h2>
        </div>
        <ViolationRecords violationType={violationType} />
      </section>
    );
  };

  const renderBlacklist = () => {
    if (!showBlacklist) return null;

    return (
      <section className="pt-4 lg:px-4">
        <div className="flex items-center">
          <ChevronLeft
            className="mr-2 h-5 w-5 cursor-pointer"
            onClick={() => {
              setShowBlacklist(false);
              // 更新URL hash并手动定位到黑名单锚点
              window.history.pushState(null, "", "#blacklist");
              setActiveTab("blacklist");
              setTimeout(() => {
                if (sectionRefs.blacklist?.current) {
                  sectionRefs.blacklist.current.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }
              }, 100);
            }}
          />
          <h2 className="text-xl font-semibold">
            {blacklistType === "board" ? "黑名单看板" : "黑名单用户"}
          </h2>
        </div>
        <UserBlacklist type={blacklistType as "board" | "user"} />
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
          ) : showBlacklist ? (
            renderBlacklist()
          ) : (
            <>
              {/* 使用 Tab 切换的内容 */}
              {getMenuOpenTabStatus(activeTab) && renderTabContent()}

              {/* 使用锚点跳转的内容 - 只显示没有 openTab 属性的菜单项 */}
              {!getMenuOpenTabStatus(activeTab) && (
                <>
                  <SettingsSection
                    ref={sectionRefs.profile}
                    id="profile"
                    title="个人资讯"
                  >
                    <ProfileSettings user={user} />
                  </SettingsSection>

                  <SettingsSection
                    ref={sectionRefs.security}
                    id="security"
                    title="帳號安全"
                  >
                    <SecuritySettings user={user} />
                  </SettingsSection>

                  <SettingsSection
                    ref={sectionRefs.notification}
                    id="notification"
                    title="通知"
                  >
                    <NotificationSettings user={user} />
                  </SettingsSection>

                  <SettingsSection
                    ref={sectionRefs.theme}
                    id="theme"
                    title="外观"
                  >
                    <ThemeSettings />
                  </SettingsSection>

                  <SettingsSection
                    ref={sectionRefs.privacy}
                    id="privacy"
                    title="隐私"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <Label className="text-base font-medium">
                            上線狀態顯示
                          </Label>
                          <p className="text-sm mt-1">
                            顯示或隱藏你的線上狀態，讓其他使用者知道你是否在線。
                          </p>
                        </div>
                        <Switch
                          checked={user?.preferences?.discloseOnline === "yes"}
                          onCheckedChange={(checked) =>
                            handleUpdatePreference(checked ? "yes" : "no")
                          }
                          aria-label="切换在线状态显示"
                        />
                      </div>
                    </div>
                  </SettingsSection>

                  <SettingsSection
                    ref={sectionRefs.blacklist}
                    id="blacklist"
                    title="黑名单"
                  >
                    <div className="divide-y">
                      <InteractiveSection
                        title="黑名单用户"
                        description="封锁指定用户，避免接收对方的讯息与互动内容。"
                        onClick={() => handleShowBlacklist("user")}
                        ariaLabel="查看看板黑名单"
                        className="pb-4"
                      />
                      <InteractiveSection
                        title="黑名单看板"
                        description="封锁指定看板，其内容将不再显示于你的页面中。"
                        onClick={() => handleShowBlacklist("board")}
                        ariaLabel="查看用户黑名单"
                        className="pt-4"
                      />
                    </div>
                  </SettingsSection>

                  <SettingsSection
                    ref={sectionRefs.violation}
                    id="violation"
                    title="违规"
                  >
                    <div className="divide-y">
                      <InteractiveSection
                        title="账号状态"
                        description="当你的文章被删除，账号被停用或发送其他重大变更时，相关通知在此显示。"
                        onClick={() => handleShowViolation("account")}
                        ariaLabel="查看账号状态违规记录"
                        className="pb-4"
                      />
                      <InteractiveSection
                        title="活动状态"
                        description="接收看板管理员对文章，权限及其他管理操作的相关通知将在此显示。"
                        onClick={() => handleShowViolation("board")}
                        ariaLabel="查看活动状态违规记录"
                        className="pt-4"
                      />
                    </div>
                  </SettingsSection>

                  <SettingsSection
                    ref={sectionRefs.language}
                    id="language"
                    title=""
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold">语言设置</h2>
                      <LanguageSettings />
                    </div>
                  </SettingsSection>

                  <SettingsSection
                    ref={sectionRefs.policy}
                    id="policy"
                    title="网站政策"
                    showBorder={false}
                  >
                    <PolicySettings />
                  </SettingsSection>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
