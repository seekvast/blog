import { create } from 'zustand';
import { DisplayMode } from '@/types/display-preferences';

interface PageDisplayPreferences {
  displayMode?: DisplayMode;
}

interface DiscussionDisplayState {
  preferences: Record<string, PageDisplayPreferences | undefined>;
  getDisplayMode: (pageId: string, fallback: DisplayMode) => DisplayMode;
  setDisplayMode: (mode: DisplayMode, pageId: string) => void;
  setInitialPreferences: (prefs: Record<string, PageDisplayPreferences | undefined>) => void;
}

export const useDiscussionDisplayStore = create<DiscussionDisplayState>((set, get) => ({
  preferences: {},
  getDisplayMode: (pageId, fallback) => {
    const pagePrefs = get().preferences[pageId];
    return pagePrefs?.displayMode ?? fallback;
  },
  setDisplayMode: (mode, pageId) =>
    set((state) => ({
      preferences: {
        ...state.preferences,
        [pageId]: {
          ...state.preferences[pageId],
          displayMode: mode,
        },
      },
    })),
  setInitialPreferences: (prefs) => set({ preferences: prefs }),
}));