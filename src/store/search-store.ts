import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SearchState {
  histories: string[];
  addHistory: (keyword: string) => void;
  clearHistories: () => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      histories: [],
      addHistory: (keyword) =>
        set((state) => {
          const newHistories = [
            keyword,
            ...state.histories.filter((item) => item !== keyword),
          ].slice(0, 10); // 最多保存10条记录
          return { histories: newHistories };
        }),
      clearHistories: () => set({ histories: [] }),
    }),
    {
      name: "search-history",
    }
  )
);
