import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { DisplayMode, SortBy } from "@/types/display-preferences";

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
  return path.replace(/\/[^\/]+(\/.+)/, '$1').replace(/\/$/, '') || '/';
};

const getCurrentPageId = (): string => {
  if (typeof window === "undefined") return "/";
  return getNormalizedPath(window.location.pathname);
};

export const useDiscussionDisplayStore = create<DiscussionDisplayState>()(
  persist(
    (set, get) => ({
      preferences: {},
      
      getDisplayMode: (pageId) => {
        const state = get();
        const currentPageId = pageId || getCurrentPageId();
        return state.preferences[currentPageId]?.displayMode || defaultPreference.displayMode;
      },
      
      getSortBy: (pageId) => {
        const state = get();
        const currentPageId = pageId || getCurrentPageId();
        return state.preferences[currentPageId]?.sortBy || defaultPreference.sortBy;
      },
      
      setDisplayMode: (mode, pageId) => {
        const currentPageId = pageId || getCurrentPageId();
        set((state) => ({
          preferences: {
            ...state.preferences,
            [currentPageId]: {
              ...state.preferences[currentPageId] || defaultPreference,
              displayMode: mode,
            },
          },
        }));
      },
      
      setSortBy: (sort, pageId) => {
        const currentPageId = pageId || getCurrentPageId();
        set((state) => ({
          preferences: {
            ...state.preferences,
            [currentPageId]: {
              ...state.preferences[currentPageId] || defaultPreference,
              sortBy: sort,
            },
          },
        }));
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
