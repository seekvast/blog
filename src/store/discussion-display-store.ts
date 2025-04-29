import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { DisplayMode, SortBy } from "@/types/display-preferences";

interface DiscussionDisplayState {
  displayMode: DisplayMode;
  sortBy: SortBy;
  setDisplayMode: (mode: DisplayMode) => void;
  setSortBy: (sort: SortBy) => void;
}

export const useDiscussionDisplayStore = create<DiscussionDisplayState>()(
  persist(
    (set) => ({
      displayMode: "list",
      sortBy: "hot",
      setDisplayMode: (mode) => set({ displayMode: mode }),
      setSortBy: (sort) => set({ sortBy: sort }),
    }),
    {
      name: "discussion-display-preferences",
      storage: createJSONStorage(() => {
        // 确保只在浏览器环境中使用 localStorage
        if (typeof window !== "undefined") {
          return localStorage;
        }

        // 服务端渲染时提供一个空的存储实现
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
    }
  )
);
