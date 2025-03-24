import { create } from "zustand";
import { useMarkdownEditor } from "./md-editor";

interface PostEditorStore {
  hasUnsavedContent: boolean;
  isVisible: boolean;
  uploadingFiles: File[];
  openFrom: string;
  setHasUnsavedContent: (hasUnsavedContent: boolean) => void;
  setIsVisible: (isVisible: boolean) => void;
  onClose: ((confirmed?: boolean) => void) | null;
  setOnClose: (onClose: ((confirmed?: boolean) => void) | null) => void;
  addUploadingFile: (file: File) => void;
  removeUploadingFile: (file: File) => void;
  insertText: (text: string) => void;
  setOpenFrom: (from: string) => void;
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
    openFrom: "",
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
    setOpenFrom: (from) => set({ openFrom: from }),
  };
});
