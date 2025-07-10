import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { DisplayMode, SortBy } from "@/types/display-preferences";
import { syncDiscussionPreferencesToCookie } from "@/lib/discussion-preferences";

interface PageDisplayPreference {
  displayMode: DisplayMode;
  sortBy: SortBy;
}

// 默认偏好设置
const defaultPreference: PageDisplayPreference = {
  displayMode: "list",
  sortBy: "hot",
};

interface DiscussionDisplayState {
  preferences: Record<string, PageDisplayPreference>;

  getDisplayMode: (pageId?: string) => DisplayMode;

  getSortBy: (pageId?: string) => SortBy;

  setDisplayMode: (mode: DisplayMode, pageId?: string) => void;

  setSortBy: (sort: SortBy, pageId?: string) => void;
}

const getNormalizedPath = (path: string): string => {
  return path.replace(/\/[^\/]+(\/.+)/, "$1").replace(/\/$/, "") || "/";
};

const getPageType = (path: string): string => {
  if (path.startsWith("/b/")) {
    return "board_pages";
  }
  if (path.startsWith("/d/")) {
    return "discussion_pages";
  }
  return path;
};

const getCurrentPageId = (): string => {
  if (typeof window === "undefined") return "/";
  const path = window.location.pathname;
  return getPageType(path);
};

// 检查是否是讨论页面（需要同步Cookie）
const isDiscussionPage = (pageId?: string): boolean => {
  if (typeof window === "undefined") return false;
  const currentPageId = pageId || getCurrentPageId();
  const path = window.location.pathname;
  return path === "/" || path === "/following" || path === "/bookmarked";
};

export const useDiscussionDisplayStore = create<DiscussionDisplayState>()(
  persist(
    (set, get) => ({
      preferences: {},

      getDisplayMode: (pageId) => {
        const state = get();
        const currentPageId = pageId || getCurrentPageId();
        return (
          state.preferences[currentPageId]?.displayMode ||
          defaultPreference.displayMode
        );
      },

      getSortBy: (pageId) => {
        const state = get();
        const currentPageId = pageId || getCurrentPageId();
        return (
          state.preferences[currentPageId]?.sortBy || defaultPreference.sortBy
        );
      },

      setDisplayMode: (mode, pageId) => {
        const currentPageId = pageId || getCurrentPageId();
        set((state) => ({
          preferences: {
            ...state.preferences,
            [currentPageId]: {
              ...(state.preferences[currentPageId] || defaultPreference),
              displayMode: mode,
            },
          },
        }));

        // 如果是讨论页面，同步到Cookie
        if (isDiscussionPage(pageId)) {
          syncDiscussionPreferencesToCookie({ display: mode });
        }
      },

      setSortBy: (sort, pageId) => {
        // 否则获取当前页面的类型作为 pageId
        const currentPageId = pageId || getCurrentPageId();
        set((state) => ({
          preferences: {
            ...state.preferences,
            [currentPageId]: {
              ...(state.preferences[currentPageId] || defaultPreference),
              sortBy: sort,
            },
          },
        }));

        // 如果是讨论页面，同步到Cookie
        if (isDiscussionPage(pageId)) {
          syncDiscussionPreferencesToCookie({ sort });
        }
      },
    }),
    {
      name: "discussion-display-preferences",
      storage: createJSONStorage(() => {
        if (typeof window !== "undefined") {
          return localStorage;
        }

        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
    }
  )
);
