import { create } from "zustand";
import { useMarkdownEditor } from "./md-editor";
import type { Discussion } from "@/types/discussion";

interface PostEditorStore {
  hasUnsavedContent: boolean;
  isVisible: boolean;
  uploadingFiles: File[];
  openFrom: "create" | "edit" | "draft";
  discussion?: Discussion;
  boardPreselect?: {
    boardId: number;
    boardChildId?: number;
  };
  setHasUnsavedContent: (hasUnsavedContent: boolean) => void;
  setIsVisible: (isVisible: boolean) => void;
  onClose: ((confirmed?: boolean) => void) | null;
  setOnClose: (onClose: ((confirmed?: boolean) => void) | null) => void;
  addUploadingFile: (file: File) => void;
  removeUploadingFile: (file: File) => void;
  insertText: (text: string) => void;
  setOpenFrom: (openFrom: "create" | "edit" | "draft") => void;
  setDiscussion: (discussion?: Discussion) => void;
  setBoardPreselect: (boardPreselect?: {
    boardId: number;
    boardChildId?: number;
  }) => void;
}

export const usePostEditorStore = create<PostEditorStore>((set) => {
  const insertText = (text: string) => {
    const editor = useMarkdownEditor.getState();
    editor.insertText(text);
  };

  return {
    hasUnsavedContent: false,
    isVisible: false,
    onClose: null,
    uploadingFiles: [],
    openFrom: "create",
    discussion: undefined,
    boardPreselect: undefined,
    setHasUnsavedContent: (hasUnsavedContent) => set({ hasUnsavedContent }),
    setIsVisible: (isVisible) => set({ isVisible }),
    setOnClose: (onClose) => set({ onClose }),
    addUploadingFile: (file) =>
      set((state) => ({
        uploadingFiles: [...state.uploadingFiles, file],
      })),
    removeUploadingFile: (file) =>
      set((state) => ({
        uploadingFiles: state.uploadingFiles.filter((f) => f !== file),
      })),
    insertText,
    setOpenFrom: (openFrom) => set({ openFrom }),
    setDiscussion: (discussion) => set({ discussion }),
    setBoardPreselect: (boardPreselect) => set({ boardPreselect }),
  };
});
