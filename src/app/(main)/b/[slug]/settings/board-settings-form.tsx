"use client";

import React, { useEffect } from "react";
import { BaseSettings } from "./components/base-settings";
import { RulesSettings } from "./components/rules-settings";
import { ApprovalSettings } from "./components/approval-settings";
import { BoardChildSettings } from "./components/board-child-settings";
import { MembersSettings } from "./components/members-settings";
import { ReportsSettings } from "./components/reports-settings";
import { BlocklistSettings } from "./components/blocklist-settings";
import { useDevice } from "@/hooks/use-device";

import { Board as BoardType } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SettingMenus, SettingTab } from "./components/setting-menus";

import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";

interface BoardSettingsFormProps {
  board: BoardType;
  onSuccess?: () => void;
}

export function BoardSettingsForm({
  board,
  onSuccess,
}: BoardSettingsFormProps) {
  const { isMobile } = useDevice();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 安全地获取 tab 参数，确保 searchParams 不为 null
  const tabParam = searchParams ? searchParams.get("tab") as SettingTab | null : null;
  const isValidTab = tabParam && [
    "general", "rules", "child-boards", "approval", 
    "members", "reports", "records", "blocklist"
  ].includes(tabParam);
  
  const [activeTab, setActiveTab] = React.useState<SettingTab>(
    isMobile ? "" : (isValidTab ? tabParam : "general")
  );
  const [initBoard, setInitBoard] = React.useState<BoardType>(board);

  const fetchBoard = async () => {
    const board = await api.boards.get({ slug: initBoard.slug });
    setInitBoard(board);
  };

  useEffect(() => {
    // 如果存在有效的 URL 参数中的 tab，则使用它，否则使用默认值
    const defaultTab = isMobile ? "" : "general";
    setActiveTab(isValidTab ? tabParam! : defaultTab);
  }, [isMobile, tabParam, isValidTab]);
  
  const handleTabClick = (tab: SettingTab) => {
    // 更新 URL 参数，同时更新状态
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (tab) {
      params.set("tab", tab);
    } else {
      params.delete("tab");
    }
    
    // 使用 replace 而不是 push，避免创建新的历史记录
    router.replace(`?${params.toString()}`);
    setActiveTab(tab);
  };

  // 根据activeTab渲染对应的内容
  const renderContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <BaseSettings board={initBoard} onSuccess={() => fetchBoard()} />
        );
      case "child-boards":
        return <BoardChildSettings board={initBoard} />;
      case "rules":
        return <RulesSettings board={initBoard} />;
      case "approval":
        return <ApprovalSettings board={initBoard} />;
      case "members":
        return <MembersSettings board={initBoard} />;
      case "reports":
        return <ReportsSettings board={initBoard} />;
      case "blocklist":
        return <BlocklistSettings board={initBoard} />;
      default:
        return null;
    }
  };

  // 移动端布局
  if (isMobile) {
    // 如果是 general，显示设置表单
    if (activeTab) {
      return (
        <div className="min-h-screen bg-background">
          {/* 移动端顶部导航 */}
          <div className="fixed top-0 left-0 right-0 z-50 flex items-center h-14 px-4 bg-background">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="mr-2"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-lg font-medium">看板設定</h1>
          </div>

          {/* 移动端主要内容 */}
          <>{renderContent()}</>
        </div>
      );
    }

    // 如果不是 general，显示设置菜单
    return (
      <div className="min-h-screen bg-background">
        {/* 移动端顶部导航 */}
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center h-14 px-4 border-b bg-background">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="mr-2"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-medium">設定</h1>
        </div>

        {/* 移动端菜单列表 */}
        <>
          <SettingMenus
            board={initBoard}
            activeTab={activeTab}
            onTabChange={handleTabClick}
          />
        </>
      </div>
    );
  }

  // 桌面端布局
  return (
    <div className="flex gap-8 pb-10">
      <div className="w-[220px] flex-shrink-0">
        <SettingMenus
          board={initBoard}
          activeTab={activeTab}
          onTabChange={handleTabClick}
        />
      </div>
      <div className="flex-1 min-w-0">
        {/* 顶部用户信息 */}
        <div className="flex pb-4 border-b">
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={initBoard.avatar} alt={initBoard.name} />
              <AvatarFallback>{initBoard.name[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{initBoard.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {initBoard.desc}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4">{renderContent()}</div>
      </div>
    </div>
  );
}
