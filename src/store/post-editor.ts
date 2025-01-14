import { create } from "zustand";

interface PostEditorStore {
  hasUnsavedContent: boolean;
  isOpen: boolean;
  setHasUnsavedContent: (hasUnsavedContent: boolean) => void;
  setIsOpen: (isOpen: boolean) => void;
  onClose: ((confirmed?: boolean) => void) | null;
  setOnClose: (onClose: ((confirmed?: boolean) => void) | null) => void;
}

export const usePostEditorStore = create<PostEditorStore>((set) => ({
  hasUnsavedContent: false,
  isOpen: false,
  onClose: null,
  setHasUnsavedContent: (hasUnsavedContent) => set({ hasUnsavedContent }),
  setIsOpen: (isOpen) => set({ isOpen }),
  setOnClose: (onClose) => set({ onClose }),
}));
