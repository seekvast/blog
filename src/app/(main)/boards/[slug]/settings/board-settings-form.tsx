"use client";

import React from "react";
import { BaseSettings } from "./components/base-settings";
import { RulesSettings } from "./components/rules-settings";
import { ApprovalSettings } from "./components/approval-settings";
import { Board as BoardType } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import BoardSettingsSidebar from "./components/board-settings-sidebar";

interface BoardSettingsFormProps {
  board: BoardType;
  onSuccess?: (board: BoardType) => void;
}

export function BoardSettingsForm({
  board,
  onSuccess,
}: BoardSettingsFormProps) {
  const [activeTab, setActiveTab] = React.useState<
    "general" | "rules" | "subboards" | "approval" | "members"
  >("general");

  // 根据activeTab渲染对应的内容
  const renderContent = () => {
    switch (activeTab) {
      case "general":
        return <BaseSettings board={board} onSuccess={onSuccess} />;
      case "rules":
        return <RulesSettings board={board} />;
      case "approval":
        return <ApprovalSettings board={board} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex gap-8 pb-10">
      <div className="w-[260px] flex-shrink-0">
        <BoardSettingsSidebar
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
