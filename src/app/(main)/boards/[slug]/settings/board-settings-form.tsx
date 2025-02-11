"use client";

import React from "react";
import { BoardSettings } from "./components/board-settings";
import { RulesSettings } from "./components/rules-settings";
import { ApprovalSettings } from "./components/approval-settings";
import { Board as BoardType } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

  return (
    <div className="max-w-7xl mx-auto">
      {/* 顶部用户信息 */}
      <div className="flex pb-4 border-b">
        <div className="flex items-start gap-4">
          <div className="flex items-start gap-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={board.avatar} alt={board.name} />
                <AvatarFallback>{board.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">{board.name}</h2>
                <p className="text-sm text-gray-500 mt-1">{board.desc}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex">
        {/* 左侧导航菜单 */}
        <div className="w-48">
          <nav className="space-y-1 py-4">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("general");
              }}
              className={`block px-4 py-2 text-sm ${
                activeTab === "general"
                  ? "text-blue-600 bg-blue-50 border-l-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              一般设置
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("subboards");
              }}
              className={`block px-4 py-2 text-sm ${
                activeTab === "subboards"
                  ? "text-blue-600 bg-blue-50 border-l-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              子版设置
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("rules");
              }}
              className={`block px-4 py-2 text-sm ${
                activeTab === "rules"
                  ? "text-blue-600 bg-blue-50 border-l-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              规则设置
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("approval");
              }}
              className={`block px-4 py-2 text-sm ${
                activeTab === "approval"
                  ? "text-blue-600 bg-blue-50 border-l-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              成员审核
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("members");
              }}
              className={`block px-4 py-2 text-sm ${
                activeTab === "members"
                  ? "text-blue-600 bg-blue-50 border-l-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              成员管理
            </a>
            <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              检举内容
            </a>
            <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              审核记录
            </a>
            <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              封锁名单
            </a>
          </nav>
        </div>

        {/* 表单内容 */}
        <div className="space-y-6 py-4 pl-8 flex-1">
          {activeTab === "general" && (
            <BoardSettings board={board} onSuccess={onSuccess} />
          )}

          {activeTab === "rules" && <RulesSettings board={board} />}

          {activeTab === "approval" && <ApprovalSettings board={board} />}
        </div>
      </div>
    </div>
  );
}
