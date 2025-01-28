import { create } from "zustand";
import type { Pagination, BoardChild } from "@/types";
import { api } from "@/lib/api";

interface BoardChildrenState {
  boardChildren: Pagination<BoardChild>;
  isLoading: boolean;
  isError: boolean;
  setBoardChildren: (children: Pagination<BoardChild>) => void;
  fetchBoardChildren: (boardId: number) => Promise<void>;
}

export const useBoardChildrenStore = create<BoardChildrenState>((set) => ({
  boardChildren: {
    code: 0,
    items: [],
    total: 0,
    per_page: 20,
    current_page: 1,
    last_page: 1,
    message: ''
  },
  isLoading: false,
  isError: false,
  setBoardChildren: (children: Pagination<BoardChild>) => set({ boardChildren: children }),
  fetchBoardChildren: async (boardId: number) => {
    try {
      set({ isLoading: true, isError: false });
      const data = await api.boards.getChildren(boardId);
      set({ boardChildren: data, isLoading: false });
    } catch (error) {
      set({ isError: true, isLoading: false });
      console.error("Failed to fetch board children:", error);
    }
  },
}));
