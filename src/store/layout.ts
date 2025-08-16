import { create } from 'zustand';

interface LayoutState {
  isHeaderVisible: boolean;
  setHeaderVisible: (isVisible: boolean) => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  isHeaderVisible: true, // 默认显示 Header
  setHeaderVisible: (isVisible) => set({ isHeaderVisible: isVisible }),
}));
