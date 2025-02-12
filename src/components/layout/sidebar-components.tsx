import { LeftSidebar } from "./left-sidebar";
import { RightSidebar } from "./right-sidebar";

// 为不同页面定制的侧边栏组件
export const BoardLeftSidebar = () => {
  return <LeftSidebar>{/* 板块特定的侧边栏内容 */}</LeftSidebar>;
};

export const BoardRightSidebar = () => {
  return <div className="space-y-4">{/* 板块特定的右侧边栏内容 */}</div>;
};

// 可以继续添加其他页面的自定义侧边栏组件

export const sidebarRegistry = {
  // 默认侧边栏
  default: {
    left: LeftSidebar,
    right: RightSidebar,
  },
  // 板块页面的侧边栏
  boards: {
    left: BoardLeftSidebar,
    right: BoardRightSidebar,
  },
  boardSettings: {
    left: null,
    right: RightSidebar,
  },
  // 可以继续添加其他页面的配置
} as const;
