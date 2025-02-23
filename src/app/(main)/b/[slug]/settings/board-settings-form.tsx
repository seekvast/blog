"use client";

import React, { useEffect } from "react";
import { BaseSettings } from "./components/base-settings";
import { RulesSettings } from "./components/rules-settings";
import { ApprovalSettings } from "./components/approval-settings";
import { BoardChildSettings } from "./components/board-child-settings";
import { MembersSettings } from "./components/members-settings";
import { useDevice } from "@/hooks/use-device";
import { cn } from "@/lib/utils";

import { Board as BoardType } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SettingMenus, SettingTab } from "./components/setting-menus";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface BoardSettingsFormProps {
  board: BoardType;
  onSuccess?: (board: BoardType) => void;
}

export function BoardSettingsForm({
  board,
  onSuccess,
}: BoardSettingsFormProps) {
  const { isMobile } = useDevice();
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<SettingTab>(
    isMobile ? "" : "general"
  );

  // 根据activeTab渲染对应的内容
  const renderContent = () => {
    switch (activeTab) {
      case "general":
        return <BaseSettings board={board} onSuccess={onSuccess} />;
      case "child-boards":
        return <BoardChildSettings board={board} />;
      case "rules":
        return <RulesSettings board={board} />;
      case "approval":
        return <ApprovalSettings board={board} />;
      case "members":
        return <MembersSettings board={board} />;
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
          <div className="pt-4">{renderContent()}</div>
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
            board={board}
            activeTab={activeTab}
            onTabChange={setActiveTab}
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
          board={board}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
      <div className="flex-1 min-w-0">
        {/* 顶部用户信息 */}
        <div className="flex pb-4 border-b">
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={board.avatar} alt={board.name} />
              <AvatarFallback>{board.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{board.name}</h2>
              <p className="text-sm text-gray-500 mt-1">{board.desc}</p>
            </div>
          </div>
        </div>

        <div className="pt-4">{renderContent()}</div>
      </div>
    </div>
  );
}
