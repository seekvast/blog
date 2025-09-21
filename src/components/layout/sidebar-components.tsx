import { LeftSidebar } from "./left-sidebar";
import { RightSidebar } from "./right-sidebar";

export const sidebarRegistry = {
  default: {
    left: LeftSidebar,
    right: RightSidebar,
  },
  boards: {
    left: LeftSidebar,
    right: RightSidebar,
  },
  boardSettings: {
    left: null, // 在此页面不显示左侧边栏
    right: null, // 也不显示右侧边栏
  },
  user: {
    left: null,
    right: null,
  },
} as const;
