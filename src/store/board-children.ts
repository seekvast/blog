import { create } from "zustand";
import type { Board, BoardChild } from "@/types";
import { boardService } from "@/services/board";

interface BoardChildrenState {
  children: BoardChild[];
  isLoading: boolean;
  isError: boolean;
  setChildren: (children: BoardChild[]) => void;
  fetchChildren: (slug: string) => Promise<void>;
}

export const useBoardChildrenStore = create<BoardChildrenState>((set) => ({
  children: [],
  isLoading: false,
  isError: false,
  setChildren: (children: BoardChild[]) => set({ children }),
  fetchChildren: async (slug: string) => {
    try {
      set({ isLoading: true, isError: false });
      const response = await boardService.getBoardChildren(slug);
      set({ children: response.data });
    } catch (error) {
      set({ isError: true });
      console.error("Failed to fetch board children:", error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
