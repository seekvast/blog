import { create } from "zustand";
import type { Draft } from "@/types/draft";
  
interface DraftStore {
  draft: Draft | null;
  hasDraft: boolean;
  setDraft: (draft: Draft | null) => void;
  clearDraft: () => void;
}

export const useDraftStore = create<DraftStore>((set) => ({
  draft: null,
  hasDraft: false,
  setDraft: (draft) => set({ draft, hasDraft: !!draft }),
  clearDraft: () => set({ draft: null, hasDraft: false }),
}));
