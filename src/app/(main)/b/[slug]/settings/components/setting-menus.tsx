import { cn } from "@/lib/utils";
import React from "react";
import { Board } from "@/types";
import { Settings, Users2, ChevronRight } from "lucide-react";
import { useDevice } from "@/hooks/use-device";
import { MembersSettings } from "./members-settings";
import { ReportsSettings } from "./reports-settings";

export type SettingTab =
  | "general"
  | "rules"
  | "child-boards"
  | "approval"
  | "members"
  | "reports"
  | "records"
  | "blocklist"
  | "";

interface SettingMenusProps {
  board: Board;
  activeTab?: SettingTab;
  onTabChange?: (tab: SettingTab) => void;
  className?: string;
}

interface MenuItem {
  id: SettingTab;
  label: string;
  description?: string;
  group: "global" | "board";
}

const menuItems: MenuItem[] = [
  {
    id: "general",
    label: "一般設定",
    description: "在此設定你的看板名稱、網址、簡介、類型以及相關管理選項。",
    group: "global",
  },
  {
    id: "child-boards",
    label: "子版設定",
    description: "創建新的子版以細分討論領域，或刪除不再需要的子版。",
    group: "board",
  },
  {
    id: "rules",
    label: "規則設置",
    description: "新增或刪除看板規則，設置違規的行為準則以維護社群秩序。",
    group: "board",
  },
  {
    id: "approval",
    label: "成員審核",
    description: "判斷用戶是否符合網帳號或特定人員，決定是否允許其加入看板。",
    group: "board",
  },
  {
    id: "members",
    label: "成員管理",
    description: "管理看板成員的權限，包含加入、移除或變更身份組。",
    group: "board",
  },
  {
    id: "reports",
    label: "檢舉內容",
    description: "查看並處理尚未解決的檢舉，確保不當內容得到及時處理。",
    group: "board",
  },
  {
    id: "records",
    label: "審核記錄",
    description:
      "查看看板管理員與版主的操作日誌，了解權限變更與內容管理活動的詳細記錄。",
    group: "board",
  },
  {
    id: "blocklist",
    label: "封鎖名單",
    description:
      "管理封鎖名單，限制特定用戶或 IP 地址存取看板的功能。",
    group: "board",
  },
];

export function SettingMenus({
  board,
  activeTab = "general",
  onTabChange,
  className,
}: SettingMenusProps) {
  const { isMobile } = useDevice();

  const handleTabClick = (
    e: React.MouseEvent<HTMLElement>,
    tab: SettingTab
  ) => {
    e.preventDefault();
    onTabChange?.(tab);
  };

  // 移动端菜单
  if (isMobile) {
    return (
      <div className={cn("space-y-4", className)}>
        {menuItems.map((item) => (
          <a
            key={item.id}
            href="#"
            onClick={(e) => handleTabClick(e, item.id)}
            className="flex flex-col p-4"
          >
            <div className="text-base font-normal">{item.label}</div>
            <div className="flex justify-center items-center">
              {item.description && (
                <div className="text-sm text-muted-foreground mt-1">
                  {item.description}
                </div>
              )}
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </a>
        ))}
      </div>
    );
  }

  // 桌面端菜单
  return (
    <div className={cn("space-y-4 rounded-lg", className)}>
      {/* 全域设定组 */}
      <div>
        <div className="flex items-center gap-2 pb-4">
          <Settings className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-500">全域設定</span>
        </div>
        <nav className="space-y-1">
          {menuItems
            .filter((item) => item.group === "global")
            .map((item) => (
              <a
                key={item.id}
                href="#"
                onClick={(e) => handleTabClick(e, item.id)}
                className={cn(
                  "flex items-center p-2 text-sm rounded-lg transition-colors",
                  activeTab === item.id
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                {item.label}
              </a>
            ))}
        </nav>
      </div>

      {/* 看板管理组 */}
      <div>
        <div className="flex items-center gap-2 pb-4">
          <Users2 className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-500">看板管理</span>
        </div>
        <nav className="space-y-1">
          {menuItems
            .filter((item) => item.group === "board")
            .map((item) => (
              <a
                key={item.id}
                href="#"
                onClick={(e) => handleTabClick(e, item.id)}
                className={cn(
                  "flex items-center p-2 text-sm rounded-lg transition-colors",
                  activeTab === item.id
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                {item.label}
              </a>
            ))}
        </nav>
      </div>
    </div>
  );
}
